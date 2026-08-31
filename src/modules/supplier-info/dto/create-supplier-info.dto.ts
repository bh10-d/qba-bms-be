import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSupplierInfoDto {
  @ApiProperty({ description: 'ID Phụ tùng sản phẩm', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Mã phụ tùng của nhà cung cấp', example: 'SUP-VG1540080015' })
  @IsNotEmpty()
  @IsString()
  productCode: string;

  @ApiProperty({ description: 'Tên nhà cung cấp', example: 'Tập đoàn Sinotruk Thượng Hải' })
  @IsOptional()
  @IsString()
  supplierName?: string;

  @ApiPropertyOptional({ description: 'URL Logo nhà cung cấp', example: '/api/v1/attachments/xyz/raw' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'URL Ảnh nhà cung cấp', example: '/api/v1/attachments/xyz/raw' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Giá mua nhà cung cấp', example: 150000 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ description: 'Số lượng tối thiểu đặt hàng', example: 10 })
  @IsOptional()
  @IsNumber()
  minQty?: number;
}