import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseItem } from './purchase-item.entity';

export enum PurchaseStatus {
  DRAFT = 'DRAFT',         // Nháp / Đang yêu cầu báo giá NCC
  CONFIRMED = 'CONFIRMED', // Đã xác nhận đơn mua
  RECEIVED = 'RECEIVED',   // Đã nhận hàng nhập kho
  DONE = 'DONE',           // Hoàn tất
  CANCELLED = 'CANCELLED', // Đã hủy
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @ApiProperty({ description: 'ID Đơn mua hàng (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã đơn mua hàng (PO Number)', example: 'P01455' })
  @Column({ name: 'po_number', unique: true })
  poNumber: string;

  @ApiProperty({ description: 'Tên Nhà cung cấp', example: 'BA - Bình An' })
  @Column({ name: 'supplier_name' })
  supplierName: string;

  @ApiProperty({ description: 'Mã Nhà cung cấp (Partner Reference)', example: 'BA 25/10/24', nullable: true })
  @Column({ name: 'partner_ref', nullable: true })
  partnerRef: string;

  @ApiProperty({ description: 'Tên Bên mua (Người phụ trách đơn mua)', example: 'NV- KT KHO', nullable: true })
  @Column({ name: 'buyer_name', nullable: true })
  buyerName: string;

  @ApiProperty({ description: 'Chứng từ gốc (Origin - e.g. Bổ sung thủ công, SO0028)', example: 'Bổ sung thủ công', nullable: true })
  @Column({ nullable: true })
  origin: string;

  @ApiProperty({ description: 'Đơn vị tiền tệ', example: 'VND', default: 'VND' })
  @Column({ default: 'VND' })
  currency: string;

  @ApiProperty({ description: 'Ngày tạo đơn mua', nullable: true })
  @Column({ name: 'date_order', type: 'timestamp', nullable: true })
  dateOrder: Date;

  @ApiProperty({ description: 'Ngày xác nhận đơn mua', nullable: true })
  @Column({ name: 'date_approve', type: 'timestamp', nullable: true })
  dateApprove: Date;

  @ApiProperty({ description: 'Ngày hàng về dự kiến', nullable: true })
  @Column({ name: 'date_planned', type: 'timestamp', nullable: true })
  datePlanned: Date;

  @ApiProperty({ description: 'Ngày hàng về thực tế', nullable: true })
  @Column({ name: 'effective_date', type: 'timestamp', nullable: true })
  effectiveDate: Date;

  @ApiProperty({ description: 'Mã số thuế Nhà cung cấp', nullable: true })
  @Column({ name: 'supplier_tax_code', nullable: true })
  supplierTaxCode: string;

  @ApiProperty({ description: 'Số điện thoại Nhà cung cấp', nullable: true })
  @Column({ name: 'supplier_phone', nullable: true })
  supplierPhone: string;

  @ApiProperty({ description: 'Địa chỉ Nhà cung cấp', nullable: true })
  @Column({ name: 'supplier_address', nullable: true })
  supplierAddress: string;

  @ApiProperty({ description: 'Tiền trước thuế Subtotal', example: 29000000 })
  @Column({ type: 'float', default: 0 })
  subtotal: number;

  @ApiProperty({ description: 'Thuế suất VAT (%)', example: 10, default: 10 })
  @Column({ type: 'float', default: 10 })
  taxRate: number;

  @ApiProperty({ description: 'Tiền thuế VAT', example: 2900000 })
  @Column({ type: 'float', default: 0 })
  taxAmount: number;

  @ApiProperty({ description: 'Tổng tiền đơn mua hàng', example: 31900000 })
  @Column({ type: 'float', default: 0 })
  totalAmount: number;

  @ApiProperty({ description: 'Trạng thái đơn mua (DRAFT, CONFIRMED, RECEIVED, DONE, CANCELLED)', enum: PurchaseStatus })
  @Column({ type: 'enum', enum: PurchaseStatus, default: PurchaseStatus.DRAFT })
  status: PurchaseStatus;

  @ApiProperty({ description: 'Ghi chú đơn mua hàng', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => PurchaseItem, (item) => item.purchaseOrder, { cascade: true, eager: true })
  items: PurchaseItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
