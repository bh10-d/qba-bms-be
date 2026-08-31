import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({ description: 'ID phụ tùng sản phẩm', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Mã nhà cung cấp (nếu có)', example: 'SUP-VG1540080015' })
  @IsOptional()
  @IsString()
  supplierProductCode?: string;

  @ApiProperty({ description: 'Tên hiển thị tùy chỉnh trên tem', example: 'LỌC DẦU ĐỘNG CƠ HOWO A7 375HP' })
  @IsOptional()
  @IsString()
  customName?: string;

  @ApiProperty({ description: 'Ngày nhập (định dạng DD/MM/YYYY hoặc YYYY-MM-DD)', example: '28/08/2026' })
  @IsOptional()
  @IsString()
  nhapDate?: string;

  @ApiProperty({ description: 'Định lượng', example: '1 Cái / Hộp' })
  @IsOptional()
  @IsString()
  dinhLuong?: string;
}
