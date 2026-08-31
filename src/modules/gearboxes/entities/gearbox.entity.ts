import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('gearboxes')
export class Gearbox {
  @ApiProperty({ description: 'ID hộp số' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mã hộp số / Tên hộp số', example: 'HW19710' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Nhãn hiệu hộp số', example: 'HWTS' })
  @Column({ nullable: true })
  brand: string;

  @ApiProperty({ description: 'Tỷ số truyền Ratio', example: '14.28' })
  @Column({ nullable: true })
  ratio: string;

  @ApiProperty({ description: 'Chủng loại', example: '10 số tiến + 2 số lùi' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Loại xe sử dụng', example: 'HOWO 371' })
  @Column({ nullable: true })
  vehicleModels: string;

  @ApiProperty({ description: 'URL Ảnh hộp số minh họa', example: '/api/v1/attachments/xyz/raw', nullable: true })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Ghi chú' })
  @Column({ nullable: true })
  note: string;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.gearbox)
  vehicles: Vehicle[];

  @ManyToMany(() => Product, (product) => product.gearboxes)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
