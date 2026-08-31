import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID Phụ tùng sản phẩm', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Số lượng mua', example: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Đơn giá bán', example: 250000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Tỷ lệ chiết khấu (%)', example: 5, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Tên Khách hàng', example: 'Công ty TNHH Vận Tải Ô Tô QBA' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiPropertyOptional({ description: 'Mã số thuế Khách hàng', example: '0101234567' })
  @IsOptional()
  @IsString()
  customerTaxCode?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại Khách hàng', example: '0987654321' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ Khách hàng', example: '123 Lê Duẩn, Đà Nẵng' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({ description: 'Thuế suất VAT (%)', example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Trạng thái ban đầu (QUOTATION hoặc CONFIRMED)', enum: OrderStatus, default: OrderStatus.QUOTATION })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Ghi chú đơn bán hàng' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Danh sách các mặt hàng sản phẩm trong đơn bán', type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
