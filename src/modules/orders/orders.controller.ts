import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrderStatus } from './entities/order.entity';

@ApiTags('Orders (Đơn Bán Hàng & Báo Giá)')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Tạo Báo Giá / Đơn Bán Hàng mới (Quản lý bán hàng phụ tùng)' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Danh sách Đơn bán hàng & Báo giá (Hỗ trợ phân trang, tìm kiếm, lọc)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại (Mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số bản ghi / trang (Mặc định: 10, Tối đa: 100)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo Mã SO hoặc Tên Khách Hàng' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus, description: 'Lọc theo trạng thái (QUOTATION, CONFIRMED, SHIPPED, DONE, CANCELLED)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll({ page, limit, search, status });
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Chi tiết Đơn bán hàng theo ID' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/confirm')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Xác nhận Đơn Bán Hàng (Tự động Xuất Kho + Tự động Sinh Hóa đơn Bán Kế toán)' })
  confirmOrder(@Param('id') id: string) {
    return this.ordersService.confirmOrder(id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Hủy Đơn bán hàng' })
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
