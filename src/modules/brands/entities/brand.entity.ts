import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

@Entity('brands')
export class Brand {
  @ApiProperty({ description: 'ID thương hiệu' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên thương hiệu', example: 'Sinotruk HOWO' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'URL Logo thương hiệu hoặc Base64', example: '/api/v1/attachments/xyz/raw', nullable: true })
  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @OneToMany(() => Product, (product) => product.brand)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
