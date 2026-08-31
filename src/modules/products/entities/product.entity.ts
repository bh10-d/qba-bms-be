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

  @OneToMany(() => ProductSupplierInfo, (supplierInfo) => supplierInfo.product)
  supplierInfos: ProductSupplierInfo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
