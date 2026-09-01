import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Products (Phụ tùng / Sản phẩm)')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({ status: 201, description: 'Sản phẩm được tạo thành công.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm (Hỗ trợ Phân trang & Tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Trang cần lấy (Mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Số bản ghi / trang (Mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, example: 'HOWO', description: 'Từ khóa tìm kiếm theo Tên, SKU, Barcode, Mã OEM' })
  @ApiQuery({ name: 'brandId', required: false, example: 1, description: 'Lọc theo ID Thương hiệu' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm phân trang được trả về thành công.' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('brandId') brandId?: number,
  ) {
    return this.productsService.findAll({ page, limit, search, brandId });
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy thông tin chi tiết của một sản phẩm' })
  @ApiResponse({ status: 200, description: 'Thông tin sản phẩm được trả về thành công.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin của một sản phẩm' })
  @ApiResponse({ status: 200, description: 'Thông tin sản phẩm được cập nhật thành công.' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa một sản phẩm' })
  @ApiResponse({ status: 200, description: 'Sản phẩm được xóa thành công.' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
