import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceType {
  OUT_INVOICE = 'OUT_INVOICE', // Hóa đơn Bán hàng (Customer Invoice)
  IN_INVOICE = 'IN_INVOICE',   // Hóa đơn Mua hàng (Vendor Bill)
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',         // Nháp
  POSTED = 'POSTED',       // Đã Ghi sổ Kế toán (Phát sinh Bút toán Nợ/Có)
  PAID = 'PAID',           // Đã Thanh toán
  CANCELLED = 'CANCELLED', // Đã Hủy
}

@Entity('accounting_invoices')
export class Invoice {
  @ApiProperty({ description: 'ID Hóa đơn' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã Số Hóa đơn', example: 'INV-2026-0001' })
  @Column({ unique: true })
  invoiceNumber: string;

  @ApiProperty({ description: 'Loại Hóa đơn', enum: InvoiceType })
  @Column({ type: 'enum', enum: InvoiceType, default: InvoiceType.OUT_INVOICE })
  type: InvoiceType;

  @ApiProperty({ description: 'Tên Khách hàng / Nhà cung cấp', example: 'Công ty TNHH Vận Tải Ô Tô QBA' })
  @Column({ name: 'partner_name' })
  partnerName: string;

  @ApiProperty({ description: 'Mã số thuế Khách hàng / NCC', example: '0101234567' })
  @Column({ name: 'partner_tax_code', nullable: true })
  partnerTaxCode: string;

  @ApiProperty({ description: 'Số điện thoại', example: '0987654321' })
  @Column({ name: 'partner_phone', nullable: true })
  partnerPhone: string;

  @ApiProperty({ description: 'Địa chỉ', example: '123 Đường Lê Duẩn, Đà Nẵng' })
  @Column({ name: 'partner_address', nullable: true })
  partnerAddress: string;

  @ApiProperty({ description: 'Tiền trước thuế', example: 10000000 })
  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @ApiProperty({ description: 'Phần trăm thuế VAT (%)', example: 10 })
  @Column({ name: 'tax_rate', type: 'numeric', precision: 5, scale: 2, default: 10 })
  taxRate: number;

  @ApiProperty({ description: 'Tiền thuế VAT', example: 1000000 })
  @Column({ name: 'tax_amount', type: 'numeric', precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @ApiProperty({ description: 'Tổng tiền thanh toán', example: 11000000 })
  @Column({ name: 'total_amount', type: 'numeric', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @ApiProperty({ description: 'Trạng thái Hóa đơn', enum: InvoiceStatus })
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @ApiProperty({ description: 'Ngày phát hành hóa đơn' })
  @Column({ name: 'issue_date', type: 'date', default: () => 'CURRENT_DATE' })
  issueDate: Date;

  @ApiProperty({ description: 'Hạn thanh toán' })
  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @ApiProperty({ description: 'Ghi chú thêm' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true, eager: true })
  items: InvoiceItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
