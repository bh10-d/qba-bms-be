import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ description: 'Tên xe', example: 'HOWO A7 375HP' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hãng xe', example: 'Sinotruk' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Model code', example: 'ZZ4257N3247N1' })
  @IsOptional()
  @IsString()
  modelCode?: string;

  @ApiProperty({ description: 'Chủng loại', example: 'Xe Đầu Kéo' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Năm sản xuất', example: '2021' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiProperty({ description: 'Đặc chủng', example: 'Cầu Dầu' })
  @IsOptional()
  @IsString()
  certificate?: string;

  @ApiProperty({ description: 'Cầu', example: 'HC16' })
  @IsOptional()
  @IsString()
  axle?: string;

  @ApiPropertyOptional({ description: 'URL Ảnh xe', example: '/uploads/vehicle-howo-a7.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Mô tả thêm' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID Động cơ xe', example: 1 })
  @IsOptional()
  @IsNumber()
  engineId?: number;

  @ApiProperty({ description: 'ID Hộp số xe', example: 1 })
  @IsOptional()
  @IsNumber()
  gearboxId?: number;
}