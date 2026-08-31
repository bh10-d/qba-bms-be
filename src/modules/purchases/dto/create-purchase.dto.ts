import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested, IsDateString } from 'class-validator';
import { PurchaseStatus } from '../entities/purchase-order.entity';

export class CreatePurchaseItemDto {
  @ApiProperty({ description: 'ID Phụ tùng sản phẩm', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Số lượng mua', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Đơn vị tính (ĐVT)', example: 'Cái', default: 'Cái' })
  @IsOptional()
  @IsString()
  uom?: string;

  @ApiProperty({ description: 'Đơn giá mua / nhập', example: 2900000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Thành tiền tùy chỉnh (Truyền 0đ đối với Hàng mẫu / Bảo hành đổi trả)', example: 0 })
  @IsOptional()
  @IsNumber()
  amount?: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ description: 'Tên Nhà cung cấp', example: 'Công Ty TNHH Phụ Tùng Antek' })
  @IsNotEmpty()
  @IsString()
  supplierName: string;

  @ApiPropertyOptional({ description: 'Mã Nhà cung cấp (Partner Reference)', example: 'TV 30/07/25' })
  @IsOptional()
  @IsString()
  partnerRef?: string;

  @ApiPropertyOptional({ description: 'Tên Bên mua (Người tạo / phụ trách)', example: 'NV- KT KHO' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ description: 'Chứng từ gốc (Origin)', example: 'Bổ sung thủ công' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ description: 'Đơn vị tiền tệ', example: 'VND', default: 'VND' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Hạn đặt hàng (dateOrder)', example: '2026-08-30T14:29:14.000Z' })
  @IsOptional()
  @IsDateString()
  dateOrder?: string;

  @ApiPropertyOptional({ description: 'Ngày hàng về dự kiến (datePlanned)', example: '2026-08-31T14:29:14.000Z' })
  @IsOptional()
  @IsDateString()
  datePlanned?: string;

  @ApiPropertyOptional({ description: 'Mã số thuế Nhà cung cấp', example: '0312345678' })
  @IsOptional()
  @IsString()
  supplierTaxCode?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại Nhà cung cấp', example: '02838383838' })
  @IsOptional()
  @IsString()
  supplierPhone?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ Nhà cung cấp', example: 'Quận Bình Tân, TP.HCM' })
  @IsOptional()
  @IsString()
  supplierAddress?: string;

  @ApiPropertyOptional({ description: 'Thuế suất VAT (%)', example: 10, default: 10 })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Trạng thái ban đầu (DRAFT hoặc CONFIRMED)', enum: PurchaseStatus, default: PurchaseStatus.DRAFT })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @ApiPropertyOptional({ description: 'Ghi chú đơn mua hàng / Điều khoản điều kiện' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Danh sách các mặt hàng sản phẩm mua', type: [CreatePurchaseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
