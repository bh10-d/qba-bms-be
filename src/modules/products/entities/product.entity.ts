import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Brand } from '../../brands/entities/brand.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Engine } from '../../engines/entities/engine.entity';
import { Gearbox } from '../../gearboxes/entities/gearbox.entity';
import { ProductSupplierInfo } from '../../supplier-info/entities/supplier-info.entity';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'ID Sản phẩm / Phụ tùng' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên phụ tùng sản phẩm', example: 'Lọc Dầu Động Cơ HOWO A7' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Mã phụ tùng (SKU / Default Code / Barcode)', example: 'VG1540080015' })
  @Column({ unique: true, nullable: true })
  defaultCode: string;

  @ApiProperty({ description: 'SKU Thương hiệu', example: 'HW-LOC-001' })
  @Column({ nullable: true })
  brandSku: string;

  @ApiProperty({ description: 'URL Ảnh sản phẩm minh họa', example: '/api/v1/attachments/xyz/raw', nullable: true })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Ảnh tem sản phẩm (base64 PNG)', nullable: true })
  @Column({ type: 'text', nullable: true })
  labelImage: string;

  @ApiProperty({ description: 'Giá bán niêm yết', example: 150000, nullable: true })
  @Column({ name: 'list_price', type: 'numeric', precision: 15, scale: 2, default: 0 })
  listPrice: number;

  @ApiProperty({ description: 'Đơn vị tính', example: 'Cái', nullable: true })
  @Column({ nullable: true, default: 'Cái' })
  unit: string;

  @ApiProperty({ description: 'Mã vạch Barcode', example: '893123456789', nullable: true })
  @Column({ nullable: true })
  barcode: string;

  @ApiProperty({ description: 'Tên danh mục sản phẩm', example: 'Lọc gió - Lọc dầu', nullable: true })
  @Column({ name: 'category_name', nullable: true })
  categoryName: string;

  @ApiProperty({ description: 'Mô tả chi tiết sản phẩm', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Trọng lượng (kg)', example: 1.5, nullable: true })
  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0 })
  weight: number;

  @ApiProperty({ description: 'Thể tích (m3)', example: 0.05, nullable: true })
  @Column({ type: 'numeric', precision: 10, scale: 3, default: 0 })
  volume: number;

  @ApiProperty({ description: 'Vị trí lưu kho vật lý (Kệ/Dãy/Tầng)', example: 'A-12-03', nullable: true })
  @Column({ name: 'location', nullable: true })
  location: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToMany(() => Vehicle, (vehicle) => vehicle.products)
  @JoinTable({
    name: 'product_vehicle_rel',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'vehicle_id', referencedColumnName: 'id' },
  })
  vehicles: Vehicle[];

  @ManyToMany(() => Engine, (engine) => engine.products)
  @JoinTable({
    name: 'product_engine_rel',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'engine_id', referencedColumnName: 'id' },
  })
  engines: Engine[];

  @ManyToMany(() => Gearbox, (gearbox) => gearbox.products)
  @JoinTable({
    name: 'product_gearbox_rel',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'gearbox_id', referencedColumnName: 'id' },
  })
  gearboxes: Gearbox[];

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'product_substitute_rel',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'substitute_id', referencedColumnName: 'id' },
  })
  substitutes: Product[];

  @OneToMany(() => ProductSupplierInfo, (supplierInfo) => supplierInfo.product)
  supplierInfos: ProductSupplierInfo[];

  @OneToMany('ProductDocument', (document: any) => document.product)
  documents: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
