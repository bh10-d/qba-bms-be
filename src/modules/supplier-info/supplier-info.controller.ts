import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SupplierInfoService } from './supplier-info.service';
import { CreateSupplierInfoDto } from './dto/create-supplier-info.dto';
import { UpdateSupplierInfoDto } from './dto/update-supplier-info.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Supplier Info (Thông tin nhà cung cấp)')
@ApiBearerAuth()
@Controller('supplier-info')
export class SupplierInfoController {
  constructor(private readonly supplierInfoService: SupplierInfoService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo thông tin nhà cung cấp mới' })
  @ApiResponse({ status: 201, description: 'Thông tin nhà cung cấp được tạo thành công.' })
  create(@Body() createSupplierInfoDto: CreateSupplierInfoDto) {
    return this.supplierInfoService.create(createSupplierInfoDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách thông tin nhà cung cấp (Hỗ trợ phân trang, tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang hiện tại (Mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số bản ghi / trang (Mặc định: 10, Tối đa: 100)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo Tên Nhà Cung Cấp hoặc Mã Phụ Tùng Riêng' })
  @ApiResponse({ status: 200, description: 'Danh sách thông tin nhà cung cấp được trả về thành công.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.supplierInfoService.findAll({ page, limit, search });
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Thông tin nhà cung cấp được trả về thành công.' })
  findOne(@Param('id') id: string) {
    return this.supplierInfoService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin của một nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Thông tin nhà cung cấp được cập nhật thành công.' })
  update(@Param('id') id: string, @Body() updateSupplierInfoDto: UpdateSupplierInfoDto) {
    return this.supplierInfoService.update(+id, updateSupplierInfoDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa một nhà cung cấp' })
  @ApiResponse({ status: 200, description: 'Nhà cung cấp được xóa thành công.' })
  remove(@Param('id') id: string) {
    return this.supplierInfoService.remove(+id);
  }
}
