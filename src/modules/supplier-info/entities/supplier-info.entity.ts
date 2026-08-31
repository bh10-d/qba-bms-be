import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

@Entity('product_supplier_infos')
export class ProductSupplierInfo {
  @ApiProperty({ description: 'ID Nhà cung cấp / Mã NCC' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mã phụ tùng của nhà cung cấp', example: 'SUP-VG1540080015' })
  @Column()
  productCode: string;

  @ApiProperty({ description: 'Tên nhà cung cấp', example: 'Tập đoàn Sinotruk Thượng Hải' })
  @Column({ nullable: true })
  supplierName: string;

  @ApiProperty({ description: 'URL Logo nhà cung cấp hoặc ảnh catalog', example: '/api/v1/attachments/xyz/raw', nullable: true })
  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @ApiProperty({ description: 'URL Ảnh nhà cung cấp hoặc ảnh catalog', example: '/api/v1/attachments/xyz/raw', nullable: true })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Giá mua nhà cung cấp', example: 150000 })
  @Column({ type: 'float', default: 0 })
  price: number;

  @ApiProperty({ description: 'Số lượng tối thiểu đặt hàng', example: 10 })
  @Column({ type: 'float', default: 1 })
  minQty: number;

  @ManyToOne(() => Product, (product) => product.supplierInfos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
