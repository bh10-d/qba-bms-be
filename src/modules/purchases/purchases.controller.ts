import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { PurchaseStatus } from './entities/purchase-order.entity';

@ApiTags('Purchases (Đơn Mua Hàng & Đặt Hàng NCC)')
@ApiBearerAuth()
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Tạo Đơn Đặt Hàng Mua từ Nhà Cung Cấp mới (Tự động lấy tên tài khoản đăng nhập cho trường Bên mua)' })
  create(@Body() createPurchaseDto: CreatePurchaseDto, @CurrentUser() currentUser?: User) {
    return this.purchasesService.create(createPurchaseDto, currentUser);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Danh sách Đơn mua hàng từ NCC (Hỗ trợ phân trang, tìm kiếm, lọc)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại (Mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số bản ghi / trang (Mặc định: 10, Tối đa: 100)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo Mã PO hoặc Tên Nhà Cung Cấp' })
  @ApiQuery({ name: 'status', required: false, enum: PurchaseStatus, description: 'Lọc theo trạng thái (CONFIRMED, DRAFT, DONE, CANCELLED)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: PurchaseStatus,
  ) {
    return this.purchasesService.findAll({ page, limit, search, status });
  }

  @Get('stats')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy các chỉ số thống kê KPI nhanh của Đơn Mua Hàng (Khớp thẻ top stats trong Odoo)' })
  getStats() {
    return this.purchasesService.getStats();
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Chi tiết Đơn mua hàng theo ID' })
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Post(':id/confirm')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Xác nhận Đơn Mua Hàng với NCC (Chuyển DRAFT -> CONFIRMED, tạo Phiếu nhập kho ở trạng thái Chờ hàng về, qtyReceived vẫn = 0)' })
  confirmPurchase(@Param('id') id: string) {
    return this.purchasesService.confirmPurchase(id);
  }

  @Post(':id/receive')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Xác nhận Nhận Hàng Thực Tế Tại Kho (Cập nhật qtyReceived = quantity, tăng tồn kho thực tế và chuyển trạng thái sang DONE)' })
  receivePurchaseItems(@Param('id') id: string) {
    return this.purchasesService.receivePurchaseItems(id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Hủy Đơn mua hàng' })
  cancelPurchase(@Param('id') id: string) {
    return this.purchasesService.cancelPurchase(id);
  }
}
