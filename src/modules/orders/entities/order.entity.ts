import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  QUOTATION = 'QUOTATION',   // Báo giá
  CONFIRMED = 'CONFIRMED',   // Đã xác nhận đơn hàng
  SHIPPED = 'SHIPPED',       // Đã giao hàng kho
  DONE = 'DONE',             // Hoàn tất
  CANCELLED = 'CANCELLED',   // Đã hủy
}

@Entity('orders')
export class Order {
  @ApiProperty({ description: 'ID Đơn bán hàng (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã đơn bán hàng (SO Number)', example: 'SO-2026-0001' })
  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @ApiProperty({ description: 'Tên Khách hàng', example: 'Công ty TNHH Vận Tải Ô Tô QBA' })
  @Column({ name: 'customer_name' })
  customerName: string;

  @ApiProperty({ description: 'Mã số thuế Khách hàng', nullable: true })
  @Column({ name: 'customer_tax_code', nullable: true })
  customerTaxCode: string;

  @ApiProperty({ description: 'Số điện thoại Khách hàng', nullable: true })
  @Column({ name: 'customer_phone', nullable: true })
  customerPhone: string;

  @ApiProperty({ description: 'Địa chỉ Khách hàng', nullable: true })
  @Column({ name: 'customer_address', nullable: true })
  customerAddress: string;

  @ApiProperty({ description: 'Tiền trước thuế Subtotal', example: 10000000 })
  @Column({ type: 'float', default: 0 })
  subtotal: number;

  @ApiProperty({ description: 'Thuế suất VAT (%)', example: 10, default: 10 })
  @Column({ type: 'float', default: 10 })
  taxRate: number;

  @ApiProperty({ description: 'Tiền thuế VAT', example: 1000000 })
  @Column({ type: 'float', default: 0 })
  taxAmount: number;

  @ApiProperty({ description: 'Tổng tiền thanh toán đơn hàng', example: 11000000 })
  @Column({ type: 'float', default: 0 })
  totalAmount: number;

  @ApiProperty({ description: 'Trạng thái đơn bán (QUOTATION, CONFIRMED, SHIPPED, DONE, CANCELLED)', enum: OrderStatus })
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.QUOTATION })
  status: OrderStatus;

  @ApiProperty({ description: 'Ghi chú đơn bán hàng', nullable: true })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
