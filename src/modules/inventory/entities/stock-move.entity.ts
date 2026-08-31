import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

export enum StockMoveType {
  IN = 'IN',           // Nhập kho từ Nhà cung cấp
  OUT = 'OUT',         // Xuất kho bán hàng cho Khách
  INTERNAL = 'INTERNAL', // Chuyển kho nội bộ
  ADJUSTMENT = 'ADJUSTMENT', // Điều chỉnh sau kiểm kê
}

@Entity('stock_moves')
export class StockMove {
  @ApiProperty({ description: 'ID Nhật ký biến động kho (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã tham chiếu nhật ký kho', example: 'WH/OUT/2026/0001' })
  @Column({ name: 'reference' })
  reference: string;

  @ApiProperty({ description: 'Loại biến động kho (IN, OUT, INTERNAL, ADJUSTMENT)', enum: StockMoveType })
  @Column({ type: 'enum', enum: StockMoveType, default: StockMoveType.OUT })
  type: StockMoveType;

  @ApiProperty({ description: 'Số lượng biến động kho (Dương = Nhập, Âm = Xuất)', example: -5 })
  @Column({ type: 'float' })
  quantity: number;

  @ApiProperty({ description: 'Ghi chú lý do xuất/nhập/điều chỉnh kho', nullable: true })
  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
