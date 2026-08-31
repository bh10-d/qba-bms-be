import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { JournalItem } from './journal-item.entity';
import { Invoice } from './invoice.entity';

export enum JournalType {
  GENERAL = 'GENERAL',   // Sổ Nhật ký Chung
  SALE = 'SALE',         // Sổ Bán hàng
  PURCHASE = 'PURCHASE', // Sổ Mua hàng
  CASH = 'CASH',         // Sổ Thu / Chi Tiền mặt
  BANK = 'BANK',         // Sổ Ngân hàng
}

@Entity('accounting_journal_entries')
export class JournalEntry {
  @ApiProperty({ description: 'ID Bút toán Kế toán' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã Bút toán Kế toán', example: 'JV-2026-0001' })
  @Column({ unique: true })
  entryNumber: string;

  @ApiProperty({ description: 'Loại Sổ Nhật ký', enum: JournalType })
  @Column({ type: 'enum', enum: JournalType, default: JournalType.GENERAL })
  journalType: JournalType;

  @ApiProperty({ description: 'Ngày ghi sổ' })
  @Column({ name: 'entry_date', type: 'date', default: () => 'CURRENT_DATE' })
  entryDate: Date;

  @ApiProperty({ description: 'Nội dung diễn giải bút toán', example: 'Ghi nhận doanh thu bán hàng hóa theo Hóa đơn INV-2026-0001' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Tổng tiền Ghi Nợ (Must equal Total Credit)', example: 11000000 })
  @Column({ name: 'total_debit', type: 'numeric', precision: 15, scale: 2, default: 0 })
  totalDebit: number;

  @ApiProperty({ description: 'Tổng tiền Ghi Có (Must equal Total Debit)', example: 11000000 })
  @Column({ name: 'total_credit', type: 'numeric', precision: 15, scale: 2, default: 0 })
  totalCredit: number;

  @ApiProperty({ description: 'Hóa đơn liên quan (nếu có)' })
  @ManyToOne(() => Invoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_id' })
  refInvoice?: Invoice;

  @ApiProperty({ description: 'Đã khóa sổ / Vào sổ' })
  @Column({ name: 'is_posted', default: true })
  isPosted: boolean;

  @OneToMany(() => JournalItem, (item) => item.journalEntry, { cascade: true, eager: true })
  items: JournalItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
