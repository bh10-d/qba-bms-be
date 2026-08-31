import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from './invoice.entity';

export enum PaymentType {
  RECEIPT = 'RECEIPT', // Phiếu Thu (Thu tiền Khách hàng)
  PAYMENT = 'PAYMENT', // Phiếu Chi (Chi tiền cho Nhà cung cấp)
}

export enum PaymentMethod {
  CASH = 'CASH', // Tiền mặt (TK 1111)
  BANK = 'BANK', // Chuyển khoản Ngân hàng (TK 1121)
}

@Entity('accounting_payments')
export class Payment {
  @ApiProperty({ description: 'ID Phiếu Thu / Chi' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Số Phiếu Thu / Chi', example: 'PT-2026-0001' })
  @Column({ unique: true })
  paymentNumber: string;

  @ApiProperty({ description: 'Loại Phiếu (RECEIPT: Thu, PAYMENT: Chi)', enum: PaymentType })
  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.RECEIPT })
  paymentType: PaymentType;

  @ApiProperty({ description: 'Hình thức thanh toán (CASH: Tiền mặt, BANK: Ngân hàng)', enum: PaymentMethod })
  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Số tiền thanh toán', example: 11000000 })
  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  amount: number;

  @ApiProperty({ description: 'Tên Khách hàng / Nhà cung cấp' })
  @Column({ name: 'partner_name' })
  partnerName: string;

  @ApiProperty({ description: 'Ngày thanh toán' })
  @Column({ name: 'payment_date', type: 'date', default: () => 'CURRENT_DATE' })
  paymentDate: Date;

  @ApiProperty({ description: 'Ghi chú / Diễn giải' })
  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => Invoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_id' })
  invoice?: Invoice;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
