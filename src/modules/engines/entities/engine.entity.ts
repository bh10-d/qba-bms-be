import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('engines')
export class Engine {
  @ApiProperty({ description: 'ID động cơ' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nhãn hiệu động cơ', example: 'Weichai' })
  @Column({ nullable: true })
  brand: string;

  @ApiProperty({ description: 'Tên động cơ', example: 'WP10.380E53' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Dung tích xy lanh', example: '9.726L' })
  @Column({ nullable: true })
  capacity: string;

  @ApiProperty({ description: 'Mã lực HP', example: '380 HP' })
  @Column({ nullable: true })
  horsepower: string;

  @ApiProperty({ description: 'Lực kéo', example: '1600 N.m' })
  @Column({ nullable: true })
  torque: string;

  @ApiProperty({ description: 'Tiêu chuẩn khí thải', example: 'Euro 5' })
  @Column({ nullable: true })
  emissionStandard: string;

  @ApiProperty({ description: 'Chủng loại', example: 'Xe tải nặng' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Các mẫu xe sử dụng', example: 'HOWO A7, HOWO V7' })
  @Column({ nullable: true })
  vehicleModels: string;

  @ApiProperty({ description: 'URL Ảnh động cơ minh họa', example: '/api/v1/attachments/xyz/raw', nullable: true })
  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Ghi chú thêm' })
  @Column({ nullable: true })
  note: string;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.engine)
  vehicles: Vehicle[];

  @ManyToMany(() => Product, (product) => product.engines)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
