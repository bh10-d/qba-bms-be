import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email của người dùng' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Mật khẩu' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A', description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '/uploads/avatar-admin.png', description: 'URL Ảnh đại diện' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID Vai trò trong bảng roles' })
  @IsOptional()
  @IsNumber()
  roleId?: number;

  @ApiPropertyOptional({ example: 'MANAGER', description: 'Mã vai trò (SUPERADMIN, ADMIN, MANAGER, STAFF, USER)' })
  @IsOptional()
  @IsString()
  roleCode?: string;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động (true: mở, false: khóa)' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}