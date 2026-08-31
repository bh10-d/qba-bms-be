import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMove, StockMoveType } from './entities/stock-move.entity';
import { StockPicking, PickingStatus } from './entities/stock-picking.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(StockMove)
    private readonly stockMoveRepository: Repository<StockMove>,
    @InjectRepository(StockPicking)
    private readonly stockPickingRepository: Repository<StockPicking>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async recordStockMove(
    productId: number,
    type: StockMoveType,
    quantity: number,
    reference: string,
    note?: string,
  ): Promise<StockMove> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm phụ tùng với ID #${productId}`);
    }

    const signedQty = type === StockMoveType.OUT ? -Math.abs(quantity) : Math.abs(quantity);

    const move = this.stockMoveRepository.create({
      reference,
      type,
      quantity: signedQty,
      product,
      note,
    });

    const saved = await this.stockMoveRepository.save(move);
    this.logger.log(`--> [StockMove] Ghi nhận ${type} [${signedQty}] cho SP [${product.name}] (Ref: ${reference})`);
    return saved;
  }

  async createPicking(data: {
    origin: string;
    partnerName?: string;
    type?: string;
    status?: PickingStatus;
    scheduledDate?: Date;
    dateDone?: Date;
    note?: string;
  }): Promise<StockPicking> {
    const count = await this.stockPickingRepository.count();
    const formattedNum = String(count + 1).padStart(5, '0');
    const pickingNumber = `WH/IN/${formattedNum}`;

    const picking = this.stockPickingRepository.create({
      pickingNumber,
      origin: data.origin,
      partnerName: data.partnerName || 'Nhà Cung Cấp',
      type: data.type || 'IN',
      status: data.status || PickingStatus.DONE,
      scheduledDate: data.scheduledDate || new Date(),
      dateDone: data.dateDone || new Date(),
      note: data.note,
    });

    const saved = await this.stockPickingRepository.save(picking);
    this.logger.log(`--> [StockPicking] Tạo phiếu nhập kho [${pickingNumber}] cho đơn [${data.origin}]`);
    return saved;
  }

  async findAllStockMoves(): Promise<StockMove[]> {
    return this.stockMoveRepository.find({
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStockByProduct(productId: number): Promise<{ productId: number; productName: string; currentStock: number }> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID #${productId}`);
    }

    const { sum } = await this.stockMoveRepository
      .createQueryBuilder('sm')
      .select('SUM(sm.quantity)', 'sum')
      .where('sm.product_id = :productId', { productId })
      .getRawOne();

    const currentStock = Number(sum) || 0;
    return {
      productId: product.id,
      productName: product.name,
      currentStock,
    };
  }

  async adjustStock(productId: number, actualStock: number, note?: string): Promise<StockMove> {
    const { currentStock } = await this.getStockByProduct(productId);
    const diff = actualStock - currentStock;

    return this.recordStockMove(
      productId,
      StockMoveType.ADJUSTMENT,
      diff,
      `ADJ-${Date.now()}`,
      note || `Điều chỉnh tồn kho thực tế từ ${currentStock} thành ${actualStock}`,
    );
  }

  // Phân hệ Phiếu Nhập Kho / Xuất Kho (Stock Picking Odoo)
  async findPickingsByOrigin(origin: string): Promise<StockPicking[]> {
    return this.stockPickingRepository.find({
      where: { origin },
      order: { createdAt: 'DESC' },
    });
  }

  async findPickingByNumber(pickingNumber: string): Promise<StockPicking> {
    const picking = await this.stockPickingRepository.findOne({
      where: { pickingNumber },
    });
    if (!picking) {
      throw new NotFoundException(`Không tìm thấy Phiếu nhập kho với mã [${pickingNumber}]`);
    }
    return picking;
  }

  async findAllPickings(query?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: StockPicking[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this.stockPickingRepository
      .createQueryBuilder('sp')
      .orderBy('sp.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query?.search) {
      qb.andWhere(
        '(LOWER(sp.pickingNumber) LIKE LOWER(:search) OR LOWER(sp.origin) LIKE LOWER(:search) OR LOWER(sp.partnerName) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
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
}
