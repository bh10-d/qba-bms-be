import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Tên phụ tùng sản phẩm', example: 'Lọc Dầu Động Cơ HOWO A7' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Mã phụ tùng (SKU / Barcode)', example: 'VG1540080015' })
  @IsOptional()
  @IsString()
  defaultCode?: string;

  @ApiProperty({ description: 'SKU Thương hiệu', example: 'HW-LOC-001' })
  @IsOptional()
  @IsString()
  brandSku?: string;

  @ApiProperty({ description: 'URL Ảnh sản phẩm minh họa', example: '/uploads/product-loc-gio.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'ID Thương hiệu', example: 1 })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiProperty({ description: 'Giá bán niêm yết', example: 150000 })
  @IsOptional()
  @IsNumber()
  listPrice?: number;

  @ApiProperty({ description: 'Đơn vị tính', example: 'Cái' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Mã vạch Barcode', example: '893123456789' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'Tên danh mục sản phẩm', example: 'Lọc Dầu - Lọc Gió' })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @ApiProperty({ description: 'Mô tả thông số kỹ thuật chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Trọng lượng (kg)', example: 1.25 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: 'Thể tích (m3)', example: 0.005 })
  @IsOptional()
  @IsNumber()
  volume?: number;

  @ApiProperty({ description: 'Vị trí kho vật lý (Dãy/Kệ/Tầng)', example: 'A-12-03' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Danh sách ID các xe áp dụng', example: [1, 2] })
  @IsOptional()
  @IsArray()
  vehicleIds?: number[];

  @ApiProperty({ description: 'Danh sách ID động cơ áp dụng', example: [1] })
  @IsOptional()
  @IsArray()
  engineIds?: number[];

  @ApiProperty({ description: 'Danh sách ID hộp số áp dụng', example: [1] })
  @IsOptional()
  @IsArray()
  gearboxIds?: number[];

  @ApiProperty({ description: 'Danh sách ID các sản phẩm thay thế tương đương', example: [10, 15] })
  @IsOptional()
  @IsArray()
  substituteIds?: number[];
}
