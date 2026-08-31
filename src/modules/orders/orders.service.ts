import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product } from '../products/entities/product.entity';
import { InventoryService } from '../inventory/inventory.service';
import { StockMoveType } from '../inventory/entities/stock-move.entity';
import { AccountingService } from '../accounting/accounting.service';
import { InvoiceType } from '../accounting/entities/invoice.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly inventoryService: InventoryService,
    private readonly accountingService: AccountingService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Đơn bán hàng phải chứa ít nhất 1 mặt hàng phụ tùng!');
    }

    const orderNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const taxRate = createOrderDto.taxRate !== undefined ? createOrderDto.taxRate : 10;
    const items: OrderItem[] = [];
    let subtotal = 0;

    for (const itemDto of createOrderDto.items) {
      const product = await this.productRepository.findOne({ where: { id: itemDto.productId } });
      if (!product) {
        throw new NotFoundException(`Không tìm thấy sản phẩm phụ tùng ID #${itemDto.productId}`);
      }

      const discountPercent = itemDto.discount || 0;
      const amount = itemDto.quantity * itemDto.unitPrice * (1 - discountPercent / 100);
      subtotal += amount;

      const item = this.orderItemRepository.create({
        productName: product.name,
        productCode: product.defaultCode || product.brandSku || `PROD-#${product.id}`,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unitPrice,
        discount: discountPercent,
        amount,
        product,
      });
      items.push(item);
    }

    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const order = this.orderRepository.create({
      orderNumber,
      customerName: createOrderDto.customerName,
      customerTaxCode: createOrderDto.customerTaxCode,
      customerPhone: createOrderDto.customerPhone,
      customerAddress: createOrderDto.customerAddress,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: createOrderDto.status || OrderStatus.QUOTATION,
      notes: createOrderDto.notes,
      items,
    });

    const savedOrder = await this.orderRepository.save(order);
    this.logger.log(`--> [Sales Order] Đã tạo Báo Giá/Đơn Bán Hàng [${orderNumber}] (Tổng tiền: ${totalAmount.toLocaleString()}đ)`);
    return savedOrder;
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
  }): Promise<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('so')
      .leftJoinAndSelect('so.items', 'item')
      .orderBy('so.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query?.search) {
      qb.andWhere(
        '(LOWER(so.orderNumber) LIKE LOWER(:search) OR LOWER(so.customerName) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query?.status) {
      qb.andWhere('so.status = :status', { status: query.status });
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy Đơn bán hàng với ID #${id}`);
    }
    return order;
  }

  async confirmOrder(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.CONFIRMED || order.status === OrderStatus.DONE) {
      throw new BadRequestException(`Đơn bán hàng [${order.orderNumber}] đã được xác nhận từ trước!`);
    }

    // 1. Tự động ghi nhận Xuất Kho (Stock Move OUT) cho tất cả phụ tùng trong đơn bán
    for (const item of order.items) {
      if (item.product) {
        await this.inventoryService.recordStockMove(
          item.product.id,
          StockMoveType.OUT,
          item.quantity,
          order.orderNumber,
          `Xuất kho bán hàng theo đơn [${order.orderNumber}] cho KH [${order.customerName}]`,
        );
      }
    }

    // 2. Tự động phát sinh Hóa đơn Bán hàng (Customer Invoice) trong Phân hệ Kế toán
    const invoiceItems = order.items.map((item) => ({
      productName: item.productName,
      productCode: item.productCode,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    }));

    await this.accountingService.createInvoice({
      type: InvoiceType.OUT_INVOICE,
      partnerName: order.customerName,
      partnerTaxCode: order.customerTaxCode,
      partnerPhone: order.customerPhone,
      partnerAddress: order.customerAddress,
      subtotal: order.subtotal,
      taxRate: order.taxRate,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      notes: `Hóa đơn bán hàng tự động phát sinh từ Đơn bán [${order.orderNumber}]`,
      items: invoiceItems as any,
    });

    order.status = OrderStatus.CONFIRMED;
    const updated = await this.orderRepository.save(order);
    this.logger.log(`--> [Sales Order Confirm] Tự động Xuất Kho & Sinh Hóa đơn Bán hàng cho Đơn [${order.orderNumber}]!`);
    return updated;
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (order.status === OrderStatus.DONE) {
      throw new BadRequestException(`Không thể hủy đơn bán hàng đã hoàn tất!`);
    }
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
