import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentMethod, PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiPropertyOptional({ example: 'RECEIPT', enum: PaymentType, description: 'RECEIPT (Thu tiền khách), PAYMENT (Chi tiền cho NCC)' })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @ApiPropertyOptional({ example: 'CASH', enum: PaymentMethod, description: 'CASH (Tiền mặt 1111), BANK (Ngân hàng 1121)' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({ example: 11000000, description: 'Số tiền thanh toán' })
  @IsNumber()
  @Min(1, { message: 'Số tiền thanh toán phải lớn hơn 0' })
  amount: number;

  @ApiProperty({ example: 'Công ty TNHH Vận Tải Ô Tô QBA', description: 'Tên Khách hàng / Nhà cung cấp' })
  @IsString()
  @IsNotEmpty({ message: 'Tên người nộp/nhận tiền không được để trống' })
  partnerName: string;

  @ApiPropertyOptional({ description: 'ID Hóa đơn liên quan (nếu thanh toán cho Hóa đơn)' })
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiPropertyOptional({ example: 'Thu tiền bán phụ tùng theo Hóa đơn INV-2026-0001', description: 'Ghi chú / Lý do thu chi' })
  @IsOptional()
  @IsString()
  note?: string;
}
