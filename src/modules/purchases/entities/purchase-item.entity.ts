import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('purchase_items')
export class PurchaseItem {
  @ApiProperty({ description: 'ID chi tiết mặt hàng mua' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên phụ tùng sản phẩm mua', example: 'Ruột sinh hàn WP6.240/6105 Sinotruck' })
  @Column({ type: 'text', nullable: true })
  productName: string;

  @ApiProperty({ description: 'Mã phụ tùng (SKU / Code)', example: 'RSH.014' })
  @Column({ nullable: true })
  productCode: string;

  @ApiProperty({ description: 'Số lượng đặt mua', example: 2 })
  @Column({ type: 'float', default: 1 })
  quantity: number;

  @ApiProperty({ description: 'Số lượng đã nhận nhập kho', example: 2 })
  @Column({ name: 'qty_received', type: 'float', default: 0 })
  qtyReceived: number;

  @ApiProperty({ description: 'Số lượng đã thanh toán hóa đơn', example: 0 })
  @Column({ name: 'qty_invoiced', type: 'float', default: 0 })
  qtyInvoiced: number;

  @ApiProperty({ description: 'Đơn vị tính (ĐVT)', example: 'Cái', default: 'Cái' })
  @Column({ default: 'Cái', nullable: true })
  uom: string;

  @ApiProperty({ description: 'Đơn giá mua / nhập kho', example: 641000 })
  @Column({ type: 'float', default: 0 })
  unitPrice: number;

  @ApiProperty({ description: 'Thành tiền mặt hàng mua', example: 1282000 })
  @Column({ type: 'float', default: 0 })
  amount: number;

  @ManyToOne(() => PurchaseOrder, (po) => po.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
