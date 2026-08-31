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
}
