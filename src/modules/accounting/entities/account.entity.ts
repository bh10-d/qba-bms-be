import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum AccountType {
  ASSET = 'ASSET',         // Tài sản (1xx, 2xx)
  LIABILITY = 'LIABILITY', // Nợ phải trả (3xx)
  EQUITY = 'EQUITY',       // Vốn chủ sở hữu (4xx)
  REVENUE = 'REVENUE',     // Doanh thu (5xx, 7xx)
  EXPENSE = 'EXPENSE',     // Chi phí (6xx, 8xx)
}

@Entity('accounting_accounts')
export class Account {
  @ApiProperty({ description: 'ID Tài khoản Kế toán' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Mã Tài khoản (Chuẩn Thông tư 200/133)', example: '1111' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: 'Tên Tài khoản', example: 'Tiền mặt Việt Nam Đồng' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Loại tài khoản (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)', enum: AccountType })
  @Column({ type: 'enum', enum: AccountType, default: AccountType.ASSET })
  type: AccountType;

  @ApiProperty({ description: 'Mã tài khoản cha (nếu có)', example: '111' })
  @Column({ name: 'parent_code', nullable: true })
  parentCode?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
