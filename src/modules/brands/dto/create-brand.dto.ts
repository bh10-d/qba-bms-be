import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ description: 'Tên thương hiệu', example: 'Sinotruk HOWO' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'URL Logo thương hiệu', example: '/uploads/brand-sinotruk.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;
}