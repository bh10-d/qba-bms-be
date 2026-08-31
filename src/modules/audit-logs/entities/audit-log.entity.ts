import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
@Index(['resModel', 'resId'])
@Index(['poNumber'])
export class AuditLog {
  @ApiProperty({ description: 'ID Nhật ký lịch sử' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên Model thực thể (PurchaseOrder, Order, Product, Brand)', example: 'PurchaseOrder' })
  @Column({ name: 'res_model' })
  resModel: string;

  @ApiProperty({ description: 'ID thực thể', example: 'P01455' })
  @Column({ name: 'res_id' })
  resId: string;

  @ApiProperty({ description: 'Mã PO đính kèm (nếu có)', nullable: true, example: 'P01455' })
  @Column({ name: 'po_number', nullable: true })
  poNumber: string;

  @ApiProperty({ description: 'Người thực hiện / Tác giả', example: 'NV- KT KHO' })
  @Column({ name: 'author_name', default: 'NV- KT KHO' })
  authorName: string;

  @ApiProperty({ description: 'Loại hành động (CREATE, UPDATE, STATUS_CHANGE, COMMENT)', example: 'STATUS_CHANGE' })
  @Column({ default: 'UPDATE' })
  action: string;

  @ApiProperty({ description: 'Nội dung chi tiết nhật ký (HTML / Markdown)', example: 'Đơn mua hàng được tạo' })
  @Column({ type: 'text', nullable: true })
  body: string;

  @ApiProperty({ description: 'Mảng theo dõi biến động các trường', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  trackingValues: Record<string, any>[];

  @ApiProperty({ description: 'Thời gian phát sinh nhật ký' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
