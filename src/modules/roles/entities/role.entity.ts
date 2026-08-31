import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'ID Vai trò' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tên vai trò', example: 'Super Administrator' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Mã vai trò (Duy nhất)', example: 'SUPERADMIN' })
  @Column({ unique: true })
  code: string;

  @ApiProperty({ description: 'Trọng số cấp bậc (Số càng lớn cấp càng cao)', example: 100 })
  @Column({ type: 'int', default: 20 })
  level: number;

  @ApiProperty({ description: 'Mô tả chi tiết vai trò' })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Vai trò hệ thống mặc định (Không cho xóa)' })
  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
