import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account, AccountType } from './entities/account.entity';
import { Invoice, InvoiceStatus, InvoiceType } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { JournalEntry, JournalType } from './entities/journal-entry.entity';
import { JournalItem } from './entities/journal-item.entity';
import { Payment, PaymentMethod, PaymentType } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class AccountingService {
  private readonly logger = new Logger(AccountingService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalItem)
    private readonly journalItemRepository: Repository<JournalItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseRepository: Repository<PurchaseOrder>,
  ) {}

  // 1. Tự động Khởi tạo Hệ thống Tài khoản Kế toán Chuẩn Thông tư 200/133
  async seedStandardAccounts(): Promise<Account[]> {
    const standardAccounts = [
      { code: '1111', name: 'Tiền mặt Việt Nam Đồng', type: AccountType.ASSET, parentCode: '111' },
      { code: '1121', name: 'Tiền gửi Ngân hàng Việt Nam Đồng', type: AccountType.ASSET, parentCode: '112' },
      { code: '131', name: 'Phải thu của khách hàng', type: AccountType.ASSET },
      { code: '1331', name: 'Thuế GTGT được khấu trừ của hàng hóa, dịch vụ', type: AccountType.ASSET, parentCode: '133' },
      { code: '1561', name: 'Giá mua hàng hóa tồn kho', type: AccountType.ASSET, parentCode: '156' },
      { code: '331', name: 'Phải trả cho người bán (Nhà cung cấp)', type: AccountType.LIABILITY },
      { code: '33311', name: 'Thuế GTGT đầu ra phải nộp', type: AccountType.LIABILITY, parentCode: '333' },
      { code: '4111', name: 'Vốn góp của chủ sở hữu', type: AccountType.EQUITY, parentCode: '411' },
      { code: '5111', name: 'Doanh thu bán hàng hóa phụ tùng', type: AccountType.REVENUE, parentCode: '511' },
      { code: '632', name: 'Giá vốn hàng bán', type: AccountType.EXPENSE },
      { code: '642', name: 'Chi phí quản lý doanh nghiệp', type: AccountType.EXPENSE },
      { code: '911', name: 'Xác định kết quả kinh doanh', type: AccountType.EXPENSE },
    ];

    const savedAccounts: Account[] = [];
    for (const accData of standardAccounts) {
      let acc = await this.accountRepository.findOne({ where: { code: accData.code } });
      if (!acc) {
        acc = await this.accountRepository.save(this.accountRepository.create(accData));
        this.logger.log(`  + Seeded Account: ${acc.code} - ${acc.name}`);
      }
      savedAccounts.push(acc);
    }
    return savedAccounts;
  }

  // 2. Lấy danh sách Tài khoản Kế toán
  async findAllAccounts(): Promise<Account[]> {
    return this.accountRepository.find({ order: { code: 'ASC' } });
  }

  // 3. Tạo Hóa đơn Kế toán Mới (Customer Invoice hoặc Vendor Bill)
  async createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
    const type = dto.type || InvoiceType.OUT_INVOICE;
    const prefix = type === InvoiceType.OUT_INVOICE ? 'INV' : 'BILL';
    const year = new Date().getFullYear();
    const count = await this.invoiceRepository.count();
    const invoiceNumber = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;

    let subtotal = 0;
    const items = dto.items.map((itemDto) => {
      const amount = itemDto.quantity * itemDto.unitPrice;
      subtotal += amount;
      return this.invoiceItemRepository.create({
        ...itemDto,
        amount,
      });
    });

    const taxRate = dto.taxRate ?? 10;
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;

    const newInvoice = this.invoiceRepository.create({
      invoiceNumber,
      type,
      partnerName: dto.partnerName,
      partnerTaxCode: dto.partnerTaxCode,
      partnerPhone: dto.partnerPhone,
      partnerAddress: dto.partnerAddress,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: InvoiceStatus.DRAFT,
      notes: dto.notes,
      items,
    });

    return this.invoiceRepository.save(newInvoice);
  }

  // 4. Lấy danh sách Hóa đơn
  async findAllInvoices(): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 5. Tìm chi tiết Hóa đơn theo ID
  async findOneInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy hóa đơn với ID #${id}`);
    }
    return invoice;
  }

  // 6. Ghi sổ Hóa đơn (Post Invoice) -> TỰ ĐỘNG PHÁT SINH BÚT TOÁN KẾ TOÁN NỢ/CÓ KÉP
  async postInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException(`Hóa đơn đã ở trạng thái ${invoice.status}, không thể ghi sổ lại`);
    }

    // Đổi trạng thái sang POSTED
    invoice.status = InvoiceStatus.POSTED;
    const updatedInvoice = await this.invoiceRepository.save(invoice);

    // TỰ ĐỘNG PHÁT SINH BÚT TOÁN KẾ TOÁN (Journal Entry)
    await this.generateJournalEntryForInvoice(updatedInvoice);

    return updatedInvoice;
  }

  // 7. Tạo Phiếu Thu / Phiếu Chi (Payment)
  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    const paymentType = dto.paymentType || PaymentType.RECEIPT;
    const paymentMethod = dto.paymentMethod || PaymentMethod.CASH;
    const prefix = paymentType === PaymentType.RECEIPT ? 'PT' : 'PC';
    const year = new Date().getFullYear();
    const count = await this.paymentRepository.count();
    const paymentNumber = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;

    let invoice: Invoice | undefined;
    if (dto.invoiceId) {
      invoice = await this.findOneInvoice(dto.invoiceId);
    }

    const newPayment = this.paymentRepository.create({
      paymentNumber,
      paymentType,
      paymentMethod,
      amount: dto.amount,
      partnerName: dto.partnerName,
      invoice,
      note: dto.note,
    });

    const savedPayment = await this.paymentRepository.save(newPayment);

    // Cập nhật trạng thái Hóa đơn liên quan thành PAID nếu thanh toán đủ
    if (invoice && invoice.status === InvoiceStatus.POSTED) {
      invoice.status = InvoiceStatus.PAID;
      await this.invoiceRepository.save(invoice);
    }

    // TỰ ĐỘNG PHÁT SINH BÚT TOÁN KẾ TOÁN CHO PHIẾU THU / CHI
    await this.generateJournalEntryForPayment(savedPayment);

    return savedPayment;
  }

  // 8. Lấy danh sách Phiếu Thu / Chi
  async findAllPayments(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['invoice'],
      order: { createdAt: 'DESC' },
    });
  }

  // 9. Lấy Sổ Bút toán Kế toán (Journal Entries)
  async findAllJournalEntries(): Promise<JournalEntry[]> {
    return this.journalEntryRepository.find({
      relations: ['refInvoice'],
      order: { createdAt: 'DESC' },
    });
  }

  // --- PRIVATE HELPER: Tự động Định khoản Kế toán kép cho Hóa đơn ---
  private async generateJournalEntryForInvoice(invoice: Invoice) {
    const year = new Date().getFullYear();
    const count = await this.journalEntryRepository.count();
    const entryNumber = `JV-INV-${year}-${String(count + 1).padStart(4, '0')}`;

    const journalItems: JournalItem[] = [];

    if (invoice.type === InvoiceType.OUT_INVOICE) {
      // Hóa đơn Bán hàng (OUT_INVOICE):
      // Ghi Nợ TK 131 (Phải thu KH): Tổng tiền
      // Ghi Có TK 5111 (Doanh thu bán hàng): Subtotal
      // Ghi Có TK 33311 (Thuế GTGT đầu ra): Tax Amount
      journalItems.push(
        this.journalItemRepository.create({
          accountCode: '131',
          accountName: 'Phải thu của khách hàng',
          debit: invoice.totalAmount,
          credit: 0,
          note: `Phải thu từ ${invoice.partnerName}`,
        }),
        this.journalItemRepository.create({
          accountCode: '5111',
          accountName: 'Doanh thu bán hàng hóa phụ tùng',
          debit: 0,
          credit: invoice.subtotal,
          note: 'Doanh thu bán hàng hóa',
        }),
      );

      if (invoice.taxAmount > 0) {
        journalItems.push(
          this.journalItemRepository.create({
            accountCode: '33311',
            accountName: 'Thuế GTGT đầu ra phải nộp',
            debit: 0,
            credit: invoice.taxAmount,
            note: 'Thuế GTGT đầu ra (10%)',
          }),
        );
      }
    } else {
      // Hóa đơn Mua hàng (IN_INVOICE):
      // Ghi Nợ TK 1561 (Hàng hóa kho): Subtotal
      // Ghi Nợ TK 1331 (Thuế GTGT đầu vào): Tax Amount
      // Ghi Có TK 331 (Phải trả người bán): Tổng tiền
      journalItems.push(
        this.journalItemRepository.create({
          accountCode: '1561',
          accountName: 'Giá mua hàng hóa tồn kho',
          debit: invoice.subtotal,
          credit: 0,
          note: 'Nhập kho mua hàng hóa',
        }),
      );

      if (invoice.taxAmount > 0) {
        journalItems.push(
          this.journalItemRepository.create({
            accountCode: '1331',
            accountName: 'Thuế GTGT được khấu trừ',
            debit: invoice.taxAmount,
            credit: 0,
            note: 'Thuế GTGT đầu vào',
          }),
        );
      }

      journalItems.push(
        this.journalItemRepository.create({
          accountCode: '331',
          accountName: 'Phải trả cho người bán (Nhà cung cấp)',
          debit: 0,
          credit: invoice.totalAmount,
          note: `Phải trả cho ${invoice.partnerName}`,
        }),
      );
    }

    const journalEntry = this.journalEntryRepository.create({
      entryNumber,
      journalType: invoice.type === InvoiceType.OUT_INVOICE ? JournalType.SALE : JournalType.PURCHASE,
      description: `Bút toán ghi nhận Hóa đơn ${invoice.invoiceNumber} - ${invoice.partnerName}`,
      totalDebit: invoice.totalAmount,
      totalCredit: invoice.totalAmount,
      refInvoice: invoice,
      isPosted: true,
      items: journalItems,
    });

    await this.journalEntryRepository.save(journalEntry);
    this.logger.log(`  + Đã tự động tạo Bút toán Kế toán kép: ${entryNumber}`);
  }

  // --- PRIVATE HELPER: Tự động Định khoản Kế toán kép cho Phiếu Thu / Chi ---
  private async generateJournalEntryForPayment(payment: Payment) {
    const year = new Date().getFullYear();
    const count = await this.journalEntryRepository.count();
    const entryNumber = `JV-PAY-${year}-${String(count + 1).padStart(4, '0')}`;

    const cashAccountCode = payment.paymentMethod === PaymentMethod.CASH ? '1111' : '1121';
    const cashAccountName = payment.paymentMethod === PaymentMethod.CASH ? 'Tiền mặt VNĐ' : 'Tiền gửi Ngân hàng';

    const journalItems: JournalItem[] = [];

    if (payment.paymentType === PaymentType.RECEIPT) {
      // Phiếu Thu tiền Khách hàng:
      // Ghi Nợ TK 1111 / 1121 (Tiền): +Amount
      // Ghi Có TK 131 (Phải thu KH): -Amount
      journalItems.push(
        this.journalItemRepository.create({
          accountCode: cashAccountCode,
          accountName: cashAccountName,
          debit: payment.amount,
          credit: 0,
          note: `Thu tiền từ ${payment.partnerName}`,
        }),
        this.journalItemRepository.create({
          accountCode: '131',
          accountName: 'Phải thu của khách hàng',
          debit: 0,
          credit: payment.amount,
          note: `Giảm trừ công nợ phải thu của ${payment.partnerName}`,
        }),
      );
    } else {
      // Phiếu Chi tiền Nhà cung cấp:
      // Ghi Nợ TK 331 (Phải trả NCC): +Amount
      // Ghi Có TK 1111 / 1121 (Tiền): -Amount
      journalItems.push(
        this.journalItemRepository.create({
          accountCode: '331',
          accountName: 'Phải trả cho người bán (Nhà cung cấp)',
          debit: payment.amount,
          credit: 0,
          note: `Giảm trừ công nợ phải trả cho ${payment.partnerName}`,
        }),
        this.journalItemRepository.create({
          accountCode: cashAccountCode,
          accountName: cashAccountName,
          debit: 0,
          credit: payment.amount,
          note: `Chi tiền trả cho ${payment.partnerName}`,
        }),
      );
    }

    const journalEntry = this.journalEntryRepository.create({
      entryNumber,
      journalType: payment.paymentMethod === PaymentMethod.CASH ? JournalType.CASH : JournalType.BANK,
      description: `Bút toán thanh toán ${payment.paymentNumber} - ${payment.partnerName}`,
      totalDebit: payment.amount,
      totalCredit: payment.amount,
      refInvoice: payment.invoice,
      isPosted: true,
      items: journalItems,
    });

    await this.journalEntryRepository.save(journalEntry);
    this.logger.log(`  + Đã tự động tạo Bút toán Kế toán Thanh toán: ${entryNumber}`);
  }

  // 10. TỰ ĐỘNG TẠO HÓA ĐƠN BÁN HÀNG TỪ ĐƠN BÁN (SO)
  async createInvoiceFromOrder(orderId: string): Promise<Invoice> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn bán hàng với ID #${orderId}`);
    }

    const itemsDto = order.items.map((i) => ({
      productName: i.productName,
      productCode: i.productCode,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    return this.createInvoice({
      type: InvoiceType.OUT_INVOICE,
      partnerName: order.customerName,
      partnerTaxCode: order.customerTaxCode,
      partnerPhone: order.customerPhone,
      partnerAddress: order.customerAddress,
      taxRate: order.taxRate,
      notes: `Hóa đơn bán hàng sinh tự động từ Đơn hàng ${order.orderNumber}`,
      items: itemsDto,
    });
  }

  // 11. TỰ ĐỘNG TẠO HÓA ĐƠN MUA HÀNG (VENDOR BILL) TỪ ĐƠN MUA (PO)
  async createInvoiceFromPurchase(purchaseId: string): Promise<Invoice> {
    const po = await this.purchaseRepository.findOne({
      where: { id: purchaseId },
      relations: ['items'],
    });
    if (!po) {
      throw new NotFoundException(`Không tìm thấy đơn mua hàng với ID #${purchaseId}`);
    }

    const itemsDto = po.items.map((i) => ({
      productName: i.productName,
      productCode: i.productCode,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }));

    return this.createInvoice({
      type: InvoiceType.IN_INVOICE,
      partnerName: po.supplierName,
      partnerTaxCode: po.supplierTaxCode,
      partnerPhone: po.supplierPhone,
      partnerAddress: po.supplierAddress,
      taxRate: po.taxRate,
      notes: `Hóa đơn mua hàng sinh tự động từ Đơn mua ${po.poNumber}`,
      items: itemsDto,
    });
  }

  // 12. BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH (PROFIT AND LOSS STATEMENT - P&L)
  async getProfitAndLossReport() {
    const salesRes = await this.orderRepository
      .createQueryBuilder('o')
      .select('SUM(o.totalAmount)', 'totalRevenue')
      .getRawOne();
    const totalRevenue = Number(salesRes?.totalRevenue) || 0;

    const purchaseRes = await this.purchaseRepository
      .createQueryBuilder('po')
      .select('SUM(po.totalAmount)', 'totalCostOfGoods')
      .getRawOne();
    const cogs = Number(purchaseRes?.totalCostOfGoods) || 0;

    const grossProfit = totalRevenue - cogs;
    const operatingExpenses = 0; // Chi phí quản lý
    const netProfit = grossProfit - operatingExpenses;

    return {
      title: 'Báo cáo Kết quả Hoạt động Kinh doanh (P&L)',
      period: 'Tất cả các kỳ',
      revenue: {
        code: '5111',
        name: 'Doanh thu bán hàng hóa phụ tùng',
        amount: totalRevenue,
      },
      cogs: {
        code: '632',
        name: 'Giá vốn hàng bán / Chi phí nhập mua',
        amount: cogs,
      },
      grossProfit,
      operatingExpenses: {
        code: '642',
        name: 'Chi phí quản lý doanh nghiệp',
        amount: operatingExpenses,
      },
      netProfit,
    };
  }

  // 13. BẢNG CÂN ĐỐI SỐ PHÁT SINH TÀI KHOẢN (TRIAL BALANCE)
  async getTrialBalanceReport() {
    const accounts = await this.findAllAccounts();
    const items = await this.journalItemRepository.find();

    const balanceMap: Record<string, { debit: number; credit: number }> = {};
    for (const item of items) {
      if (!balanceMap[item.accountCode]) {
        balanceMap[item.accountCode] = { debit: 0, credit: 0 };
      }
      balanceMap[item.accountCode].debit += Number(item.debit) || 0;
      balanceMap[item.accountCode].credit += Number(item.credit) || 0;
    }

    let totalDebitSum = 0;
    let totalCreditSum = 0;

    const reportRows = accounts.map((acc) => {
      const b = balanceMap[acc.code] || { debit: 0, credit: 0 };
      totalDebitSum += b.debit;
      totalCreditSum += b.credit;
      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: b.debit,
        credit: b.credit,
        netBalance: b.debit - b.credit,
      };
    });

    return {
      title: 'Bảng Cân đối Số phát sinh Tài khoản Kế toán (Trial Balance)',
      totalDebit: totalDebitSum,
      totalCredit: totalCreditSum,
      isBalanced: totalDebitSum === totalCreditSum,
      accounts: reportRows,
    };
  }

  // 14. BÁO CÁO CÔNG NỢ PHẢI THU / PHẢI TRẢ THEO ĐỐI TÁC (PARTNER BALANCES)
  async getPartnerBalancesReport() {
    const invoices = await this.invoiceRepository.find();
    const partnerMap: Record<string, { partnerName: string; receivable: number; payable: number }> = {};

    for (const inv of invoices) {
      const name = inv.partnerName || 'Khách/Đối tác';
      if (!partnerMap[name]) {
        partnerMap[name] = { partnerName: name, receivable: 0, payable: 0 };
      }

      const amount = Number(inv.totalAmount) || 0;
      if (inv.type === InvoiceType.OUT_INVOICE) {
        partnerMap[name].receivable += inv.status === InvoiceStatus.PAID ? 0 : amount;
      } else {
        partnerMap[name].payable += inv.status === InvoiceStatus.PAID ? 0 : amount;
      }
    }

    const partners = Object.values(partnerMap);
    const totalReceivable = partners.reduce((sum, p) => sum + p.receivable, 0);
    const totalPayable = partners.reduce((sum, p) => sum + p.payable, 0);

    return {
      title: 'Báo cáo Tổng hợp Công nợ Khách hàng & Nhà cung cấp',
      totalReceivable,
      totalPayable,
      partners,
    };
  }

  // 15. XÓA HÓA ĐƠN KẾ TOÁN (VÀ DỌN DẸP BÚT TOÁN BÊN DƯỚI)
  async removeInvoice(id: string): Promise<{ message: string; id: string }> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!invoice) {
      throw new NotFoundException(`Không tìm thấy Hóa đơn với ID #${id}`);
    }

    // Gỡ liên kết Hóa đơn trong các Phiếu Thu/Chi
    const payments = await this.paymentRepository.find({
      where: { invoice: { id } },
    });
    for (const p of payments) {
      p.invoice = undefined;
      await this.paymentRepository.save(p);
    }

    // Xóa Bút toán Kế toán phát sinh từ Hóa đơn này
    const entries = await this.journalEntryRepository.find({
      where: { refInvoice: { id } },
    });
    if (entries.length > 0) {
      await this.journalEntryRepository.remove(entries);
    }

    await this.invoiceRepository.remove(invoice);
    this.logger.log(`--> [Invoice] Xóa thành công Hóa đơn [${invoice.invoiceNumber}] (#${id})`);

    return {
      message: `Đã xóa thành công Hóa đơn ${invoice.invoiceNumber}`,
      id,
    };
  }
}
