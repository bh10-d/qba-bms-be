import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType } from '../entities/invoice.entity';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Lọc Dầu Động Cơ HOWO A7', description: 'Tên sản phẩm' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({ example: 'VG1540080015', description: 'Mã phụ tùng' })
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty({ example: 10, description: 'Số lượng' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 250000, description: 'Đơn giá chưa thuế' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional({ example: 'OUT_INVOICE', enum: InvoiceType, description: 'OUT_INVOICE (Bán hàng), IN_INVOICE (Mua hàng)' })
  @IsOptional()
  @IsEnum(InvoiceType)
  type?: InvoiceType;

  @ApiProperty({ example: 'Công ty TNHH Vận Tải Ô Tô QBA', description: 'Tên khách hàng hoặc nhà cung cấp' })
  @IsString()
  @IsNotEmpty({ message: 'Tên đối tác không được để trống' })
  partnerName: string;

  @ApiPropertyOptional({ example: '0101234567', description: 'Mã số thuế' })
  @IsOptional()
  @IsString()
  partnerTaxCode?: string;

  @ApiPropertyOptional({ example: '0987654321', description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  partnerPhone?: string;

  @ApiPropertyOptional({ example: '123 Đường Lê Duẩn, Đà Nẵng', description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  partnerAddress?: string;

  @ApiPropertyOptional({ example: 10000000, description: 'Tiền trước thuế' })
  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @ApiPropertyOptional({ example: 10, description: 'Phần trăm thuế VAT (%)' })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ example: 1000000, description: 'Tiền thuế VAT' })
  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @ApiPropertyOptional({ example: 11000000, description: 'Tổng tiền thanh toán' })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ example: 'Bán phụ tùng ô tô HOWO đợt 1', description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CreateInvoiceItemDto], description: 'Danh sách sản phẩm trong hóa đơn' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
