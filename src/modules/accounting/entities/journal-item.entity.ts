import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { JournalEntry } from './journal-entry.entity';

@Entity('accounting_journal_items')
export class JournalItem {
  @ApiProperty({ description: 'ID Chi tiết Bút toán' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mã Tài khoản Kế toán (Thông tư 200/133)', example: '131' })
  @Column({ name: 'account_code' })
  accountCode: string;

  @ApiProperty({ description: 'Tên Tài khoản Kế toán', example: 'Phải thu của khách hàng' })
  @Column({ name: 'account_name', nullable: true })
  accountName: string;

  @ApiProperty({ description: 'Số tiền Ghi Nợ (Debit)', example: 11000000 })
  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  debit: number;

  @ApiProperty({ description: 'Số tiền Ghi Có (Credit)', example: 0 })
  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  credit: number;

  @ApiProperty({ description: 'Diễn giải / Ghi chú' })
  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => JournalEntry, (entry) => entry.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;
}
