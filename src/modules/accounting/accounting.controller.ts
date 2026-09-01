import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceType, InvoiceStatus } from './entities/invoice.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Accounting (Kế toán & Tài chính)')
@ApiBearerAuth()
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post('seed-accounts')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Khởi tạo Hệ thống Tài khoản Kế toán Chuẩn Việt Nam (Thông tư 200/133)' })
  seedAccounts() {
    return this.accountingService.seedStandardAccounts();
  }

  @Get('accounts')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách Hệ thống Tài khoản Kế toán' })
  findAllAccounts() {
    return this.accountingService.findAllAccounts();
  }

  @Post('invoices')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Tạo Hóa đơn Kế toán Mới (Hóa đơn Bán hàng hoặc Hóa đơn Mua hàng)' })
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.accountingService.createInvoice(dto);
  }

  @Get('invoices')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách Hóa đơn (Hỗ trợ Phân trang & Lọc)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'INV-2026' })
  @ApiQuery({ name: 'type', required: false, enum: InvoiceType })
  @ApiQuery({ name: 'status', required: false, enum: InvoiceStatus })
  findAllInvoices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: InvoiceType,
    @Query('status') status?: InvoiceStatus,
  ) {
    return this.accountingService.findAllInvoices({ page, limit, search, type, status });
  }

  @Get('invoices/:id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Chi tiết Hóa đơn theo ID' })
  findOneInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.findOneInvoice(id);
  }

  @Post('invoices/:id/post')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Ghi sổ Hóa đơn (Tự động phát sinh Bút toán Nợ/Có kép chuẩn Kế toán)' })
  postInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.postInvoice(id);
  }

  @Post('payments')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Tạo Phiếu Thu / Phiếu Chi Kế toán' })
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.accountingService.createPayment(dto);
  }

  @Get('payments')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách Phiếu Thu / Chi (Hỗ trợ phân trang & tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'PAY-2026' })
  findAllPayments(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.accountingService.findAllPayments({ page, limit, search });
  }

  @Post('invoices/from-order/:orderId')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Tự động tạo Hóa đơn Bán hàng (OUT_INVOICE) từ Đơn hàng bán (SO)' })
  createInvoiceFromOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.accountingService.createInvoiceFromOrder(orderId);
  }

  @Post('invoices/from-purchase/:purchaseId')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Tự động tạo Hóa đơn Mua hàng / Vendor Bill (IN_INVOICE) từ Đơn mua hàng (PO)' })
  createInvoiceFromPurchase(@Param('purchaseId', ParseUUIDPipe) purchaseId: string) {
    return this.accountingService.createInvoiceFromPurchase(purchaseId);
  }

  @Get('reports/profit-and-loss')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Xem Báo cáo Kết quả Hoạt động Kinh doanh (Profit and Loss Statement - P&L)' })
  getProfitAndLossReport() {
    return this.accountingService.getProfitAndLossReport();
  }

  @Get('reports/trial-balance')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Xem Bảng Cân đối Số phát sinh Tài khoản Kế toán (Trial Balance)' })
  getTrialBalanceReport() {
    return this.accountingService.getTrialBalanceReport();
  }

  @Get('reports/partner-balances')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Xem Báo cáo Tổng hợp Công nợ Phải thu / Phải trả theo Đối tác' })
  getPartnerBalancesReport() {
    return this.accountingService.getPartnerBalancesReport();
  }

  @Get('journal-entries')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Xem Sổ Bút toán Kế toán (Hỗ trợ phân trang & tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'JV-2026' })
  findAllJournalEntries(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.accountingService.findAllJournalEntries({ page, limit, search });
  }

  @Delete('invoices/:id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Xóa một Hóa đơn Kế toán (Chỉ duy nhất SUPERADMIN có quyền xóa)' })
  removeInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.removeInvoice(id);
  }
}
