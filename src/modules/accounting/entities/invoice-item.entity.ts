import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from './invoice.entity';

@Entity('accounting_invoice_items')
export class InvoiceItem {
  @ApiProperty({ description: 'ID Dòng Hóa đơn' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên Sản phẩm / Dịch vụ', example: 'Lọc Dầu Động Cơ HOWO A7' })
  @Column()
  productName: string;

  @ApiProperty({ description: 'Mã Sản phẩm', example: 'VG1540080015' })
  @Column({ nullable: true })
  productCode: string;

  @ApiProperty({ description: 'Số lượng', example: 10 })
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ApiProperty({ description: 'Đơn giá', example: 250000 })
  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  unitPrice: number;

  @ApiProperty({ description: 'Thành tiền (Chưa thuế)', example: 2500000 })
  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  amount: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
