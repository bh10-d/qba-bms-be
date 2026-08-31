import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @ApiProperty({ description: 'ID chi tiết mặt hàng trong đơn bán' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên phụ tùng sản phẩm', example: 'Lọc gió 28X39 ISUZU FVM - 6HK1' })
  @Column()
  productName: string;

  @ApiProperty({ description: 'Mã phụ tùng (SKU / Code)', example: 'LGIO.006' })
  @Column({ nullable: true })
  productCode: string;

  @ApiProperty({ description: 'Số lượng mua', example: 5 })
  @Column({ type: 'float' })
  quantity: number;

  @ApiProperty({ description: 'Đơn giá bán', example: 250000 })
  @Column({ type: 'float' })
  unitPrice: number;

  @ApiProperty({ description: 'Tỷ lệ chiết khấu (%)', example: 5, default: 0 })
  @Column({ type: 'float', default: 0 })
  discount: number;

  @ApiProperty({ description: 'Thành tiền mặt hàng (sau chiết khấu)', example: 1187500 })
  @Column({ type: 'float' })
  amount: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
