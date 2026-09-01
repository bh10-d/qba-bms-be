import { Controller, Get, Post, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { InventoryService } from './inventory.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

class AdjustStockDto {
  @ApiProperty({ description: 'ID Sản phẩm phụ tùng', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Số lượng tồn kho thực tế sau kiểm kê', example: 50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  actualStock: number;

  @ApiProperty({ description: 'Ghi chú lý do kiểm kê điều chỉnh', example: 'Kiểm kê định kỳ tháng 8' })
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiTags('Inventory (Quản Lý Kho & Tồn Kho Real-time)')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock-moves')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Xem Nhật ký biến động kho (Hỗ trợ phân trang, tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm mã chứng từ, sản phẩm hoặc ghi chú' })
  findAllStockMoves(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAllStockMoves({ page, limit, search });
  }

  @Get('product/:productId')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.USER)
  @ApiOperation({ summary: 'Xem số lượng tồn kho hiện tại của một sản phẩm phụ tùng' })
  getStockByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.inventoryService.getStockByProduct(productId);
  }

  @Post('adjust')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Điều chỉnh số lượng tồn kho thực tế sau khi kiểm kê' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto.productId, dto.actualStock, dto.note);
  }

  @Get('pickings')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Danh sách Phiếu Nhập / Xuất Kho (Hỗ trợ phân trang, tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo Mã phiếu WH/IN/xxxx hoặc Chứng từ gốc P01455' })
  findAllPickings(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.findAllPickings({ page, limit, search });
  }

  @Get('pickings/origin/:origin')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách Phiếu Nhập/Xuất Kho theo Chứng Từ Gốc (Mã PO hoặc SO e.g. P01455)' })
  findPickingsByOrigin(@Param('origin') origin: string) {
    return this.inventoryService.findPickingsByOrigin(origin);
  }

  @Get('pickings/number/:pickingNumber')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết Phiếu Nhập Kho theo Mã Phiếu (e.g. WH/IN/01499)' })
  findPickingByNumber(@Param('pickingNumber') pickingNumber: string) {
    return this.inventoryService.findPickingByNumber(pickingNumber);
  }

  @Get('valuation')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Xem Báo cáo Tổng hợp Giá trị Tài sản Tồn kho Real-time' })
  getValuationReport() {
    return this.inventoryService.getInventoryValuationReport();
  }
}
