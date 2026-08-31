import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PickingStatus {
  DRAFT = 'DRAFT',       // Nháp
  READY = 'READY',       // Sẵn sàng
  DONE = 'DONE',         // Hoàn tất
  CANCELLED = 'CANCELLED',// Đã hủy
}

@Entity('stock_pickings')
@Index(['origin'])
@Index(['pickingNumber'])
export class StockPicking {
  @ApiProperty({ description: 'ID Phiếu chuyển / Nhập / Xuất kho (UUID)' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Mã phiếu nhập / xuất kho (Picking Number)', example: 'WH/IN/01499' })
  @Column({ name: 'picking_number', unique: true })
  pickingNumber: string;

  @ApiProperty({ description: 'Chứng từ gốc (Mã PO / SO Number)', example: 'P01455', nullable: true })
  @Column({ nullable: true })
  origin: string;

  @ApiProperty({ description: 'Tên Nhà cung cấp hoặc Khách hàng', example: 'BA - Bình An', nullable: true })
  @Column({ name: 'partner_name', nullable: true })
  partnerName: string;

  @ApiProperty({ description: 'Loại hoạt động (IN - Phiếu nhập kho, OUT - Phiếu xuất kho, INTERNAL - Chuyển kho)', example: 'IN' })
  @Column({ default: 'IN' })
  type: string;

  @ApiProperty({ description: 'Trạng thái phiếu (DRAFT, READY, DONE, CANCELLED)', enum: PickingStatus, default: PickingStatus.DONE })
  @Column({ type: 'enum', enum: PickingStatus, default: PickingStatus.DONE })
  status: PickingStatus;

  @ApiProperty({ description: 'Ngày theo kế hoạch', nullable: true })
  @Column({ name: 'scheduled_date', type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @ApiProperty({ description: 'Ngày hiệu lực / hoàn tất nhập kho', nullable: true })
  @Column({ name: 'date_done', type: 'timestamp', nullable: true })
  dateDone: Date;

  @ApiProperty({ description: 'Ghi chú phiếu nhập/xuất kho', nullable: true })
  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
