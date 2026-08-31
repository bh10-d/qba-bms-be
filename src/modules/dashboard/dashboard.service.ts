import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { Invoice } from '../accounting/entities/invoice.entity';
import { Product } from '../products/entities/product.entity';
import { ProductSupplierInfo } from '../supplier-info/entities/supplier-info.entity';
import { StockMove } from '../inventory/entities/stock-move.entity';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseRepository: Repository<PurchaseOrder>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductSupplierInfo)
    private readonly supplierInfoRepository: Repository<ProductSupplierInfo>,
    @InjectRepository(StockMove)
    private readonly stockMoveRepository: Repository<StockMove>,
  ) {}

  async getDashboardStats() {
    this.logger.log('--> Tính toán số liệu Thống kê Tài chính & Dashboard Real-time...');

    // 1. Thống kê tổng số tiền đơn bán (Sales Orders)
    const salesRes = await this.orderRepository
      .createQueryBuilder('o')
      .select('SUM(o.totalAmount)', 'totalSales')
      .addSelect('COUNT(o.id)', 'countSales')
      .getRawOne();

    const totalRevenue = Number(salesRes?.totalSales) || 0;
    const totalOrders = Number(salesRes?.countSales) || 0;

    // 2. Thống kê tổng số tiền đơn mua (Purchase Orders)
    const purchaseRes = await this.purchaseRepository
      .createQueryBuilder('po')
      .select('SUM(po.totalAmount)', 'totalPurchases')
      .addSelect('COUNT(po.id)', 'countPurchases')
      .getRawOne();

    const totalPurchases = Number(purchaseRes?.totalPurchases) || 0;
    const totalPurchaseOrders = Number(purchaseRes?.countPurchases) || 0;

    // 3. Lợi nhuận gộp ước tính
    const estimatedProfit = totalRevenue - totalPurchases;

    // 4. Doanh thu & Chi phí từ Hóa đơn Kế toán (Invoices)
    const invoicePaidRes = await this.invoiceRepository
      .createQueryBuilder('inv')
      .select('inv.type', 'type')
      .addSelect('SUM(inv.total_amount)', 'sum')
      .where("inv.status = 'PAID'")
      .groupBy('inv.type')
      .getRawMany();

    let paidRevenue = 0;
    let paidPurchases = 0;
    for (const inv of invoicePaidRes) {
      if (inv.type === 'OUT_INVOICE') paidRevenue += Number(inv.sum) || 0;
      if (inv.type === 'IN_INVOICE') paidPurchases += Number(inv.sum) || 0;
    }

    // 5. Thống kê Tồn Kho & Giá trị Tồn kho
    const totalProducts = await this.productRepository.count();

    const stockSumRes = await this.stockMoveRepository
      .createQueryBuilder('sm')
      .select('SUM(sm.quantity)', 'totalStock')
      .getRawOne();
    const totalStockItems = Math.max(0, Number(stockSumRes?.totalStock) || 0);

    // Giá trị tồn kho ước tính = Tổng lượng tồn * Giá trung bình (150.000 VNĐ / sản phẩm mẫu nếu chưa có giá)
    const inventoryValue = totalStockItems * 150000;

    // 6. Số lượng Nhà cung cấp & Khách hàng
    const totalSuppliers = await this.supplierInfoRepository
      .createQueryBuilder('info')
      .select('COUNT(DISTINCT info.supplierName)', 'count')
      .getRawOne()
      .then((res) => Number(res?.count) || 0);

    const totalCustomers = await this.orderRepository
      .createQueryBuilder('o')
      .select('COUNT(DISTINCT o.customerName)', 'count')
      .getRawOne()
      .then((res) => Number(res?.count) || 0);

    // 7. Biểu đồ Doanh Thu & Chi Phí Theo Tháng (Monthly Chart Data)
    const salesByMonth = await this.orderRepository
      .createQueryBuilder('o')
      .select("TO_CHAR(o.createdAt, 'YYYY-MM')", 'month')
      .addSelect('SUM(o.totalAmount)', 'revenue')
      .groupBy("TO_CHAR(o.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(o.createdAt, 'YYYY-MM')", 'ASC')
      .getRawMany();

    const purchasesByMonth = await this.purchaseRepository
      .createQueryBuilder('po')
      .select("TO_CHAR(po.dateOrder, 'YYYY-MM')", 'month')
      .addSelect('SUM(po.totalAmount)', 'purchases')
      .groupBy("TO_CHAR(po.dateOrder, 'YYYY-MM')")
      .orderBy("TO_CHAR(po.dateOrder, 'YYYY-MM')", 'ASC')
      .getRawMany();

    const monthlyMap: Record<string, { month: string; revenue: number; purchases: number; profit: number }> = {};

    for (const s of salesByMonth) {
      if (s.month) {
        monthlyMap[s.month] = {
          month: s.month,
          revenue: Number(s.revenue) || 0,
          purchases: 0,
          profit: Number(s.revenue) || 0,
        };
      }
    }

    for (const p of purchasesByMonth) {
      if (p.month) {
        if (!monthlyMap[p.month]) {
          monthlyMap[p.month] = { month: p.month, revenue: 0, purchases: 0, profit: 0 };
        }
        monthlyMap[p.month].purchases = Number(p.purchases) || 0;
        monthlyMap[p.month].profit = monthlyMap[p.month].revenue - monthlyMap[p.month].purchases;
      }
    }

    const monthlyRevenueChart = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // 8. Đơn mua hàng & Đơn bán hàng mới nhất
    const recentOrders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentPurchases = await this.purchaseRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      financials: {
        totalRevenue,
        totalPurchases,
        estimatedProfit,
        paidRevenue,
        paidPurchases,
        inventoryValue,
      },
      counts: {
        totalOrders,
        totalPurchases: totalPurchaseOrders,
        totalProducts,
        totalStockItems,
        totalSuppliers,
        totalCustomers,
      },
      monthlyRevenueChart,
      recentOrders,
      recentPurchases,
    };
  }
}
