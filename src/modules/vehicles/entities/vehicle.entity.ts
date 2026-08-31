import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Engine } from '../../engines/entities/engine.entity';
import { Gearbox } from '../../gearboxes/entities/gearbox.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('vehicles')
export class Vehicle {
  @ApiProperty({ description: 'ID Xe' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên xe', example: 'HOWO A7 375HP' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Hãng xe', example: 'Sinotruk' })
  @Column({ nullable: true })
  brand: string;

  @ApiProperty({ description: 'Model code', example: 'ZZ4257N3247N1' })
  @Column({ nullable: true })
  modelCode: string;

  @ApiProperty({ description: 'Chủng loại', example: 'Xe Đầu Kéo' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Năm sản xuất', example: '2021' })
  @Column({ nullable: true })
  year: string;

  @ApiProperty({ description: 'Đặc chủng', example: 'Cầu Dầu' })
  @Column({ nullable: true })
  certificate: string;

  @ApiProperty({ description: 'Cầu', example: 'HC16' })
  @Column({ nullable: true })
  axle: string;

  @ApiProperty({ description: 'URL Ảnh xe', example: '/api/v1/attachments/xyz/raw', nullable: true })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Ghi chú' })
  @Column({ nullable: true })
  note: string;

  @ApiProperty({ description: 'Mô tả thêm' })
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Engine, (engine) => engine.vehicles, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'engine_id' })
  engine: Engine;

  @ManyToOne(() => Gearbox, (gearbox) => gearbox.vehicles, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'gearbox_id' })
  gearbox: Gearbox;

  @ManyToMany(() => Product, (product) => product.vehicles)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
