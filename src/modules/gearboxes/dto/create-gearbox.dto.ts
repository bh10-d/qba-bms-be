import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGearboxDto {
  @ApiProperty({ description: 'Mã hộp số / Tên hộp số', example: 'HW19710' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Nhãn hiệu hộp số', example: 'HWTS' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ description: 'Tỷ số truyền Ratio', example: '14.28' })
  @IsOptional()
  @IsString()
  ratio?: string;

  @ApiProperty({ description: 'Chủng loại', example: '10 số tiến + 2 số lùi' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Loại xe sử dụng', example: 'HOWO 371' })
  @IsOptional()
  @IsString()
  vehicleModels?: string;

  @ApiPropertyOptional({ description: 'URL Ảnh hộp số minh họa', example: '/api/v1/attachments/xyz/raw' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;
}
