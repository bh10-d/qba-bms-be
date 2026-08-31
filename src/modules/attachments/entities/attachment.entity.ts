import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('attachments')
export class Attachment {
  @ApiProperty({ description: 'ID Attachment (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Tên tệp gốc', example: 'loc-gio-isuzu.jpg' })
  @Column({ name: 'name' })
  name: string;

  @ApiProperty({ description: 'Mã SHA1 Checksum của tệp (Cơ chế Odoo Chống Trùng)', example: '2a8f9c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b' })
  @Index()
  @Column({ name: 'checksum' })
  checksum: string;

  @ApiProperty({ description: 'Đường dẫn lưu trữ trong Storix Engine', example: 'filestore/2a/2a8f9c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b' })
  @Column({ name: 'store_key' })
  storeKey: string;

  @ApiProperty({ description: 'Loại MIME Type của file', example: 'image/jpeg' })
  @Column({ name: 'mimetype' })
  mimetype: string;

  @ApiProperty({ description: 'Kích thước tệp tính bằng Bytes', example: 1024500 })
  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @ApiProperty({ description: 'Model liên kết (Product, Brand, Vehicle, User...)', example: 'Product', nullable: true })
  @Index()
  @Column({ name: 'res_model', nullable: true })
  resModel: string;

  @ApiProperty({ description: 'ID bản ghi liên kết', example: '15', nullable: true })
  @Index()
  @Column({ name: 'res_id', nullable: true })
  resId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
