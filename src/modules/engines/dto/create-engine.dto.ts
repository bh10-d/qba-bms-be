import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEngineDto {
  @ApiProperty({ description: 'Nhãn hiệu động cơ', example: 'Weichai' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Tên động cơ', example: 'WP10.380E53' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Dung tích xy lanh', example: '9.726L' })
  @IsOptional()
  @IsString()
  capacity?: string;

  @ApiProperty({ description: 'Mã lực HP', example: '380 HP' })
  @IsOptional()
  @IsString()
  horsepower?: string;

  @ApiProperty({ description: 'Lực kéo', example: '1600 N.m' })
  @IsOptional()
  @IsString()
  torque?: string;

  @ApiProperty({ description: 'Tiêu chuẩn khí thải', example: 'Euro 5' })
  @IsOptional()
  @IsString()
  emissionStandard?: string;

  @ApiProperty({ description: 'Chủng loại', example: 'Xe tải nặng' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Các mẫu xe sử dụng', example: 'HOWO A7, HOWO V7' })
  @IsOptional()
  @IsString()
  vehicleModels?: string;

  @ApiPropertyOptional({ description: 'URL Ảnh động cơ minh họa', example: '/api/v1/attachments/xyz/raw' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Ghi chú thêm' })
  @IsOptional()
  @IsString()
  note?: string;
}
