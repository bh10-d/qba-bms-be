import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Quản Lý Kho Nam', description: 'Tên hiển thị của vai trò' })
  @IsString()
  @IsNotEmpty({ message: 'Tên vai trò không được để trống' })
  name: string;

  @ApiProperty({ example: 'MANAGER_KHO_NAM', description: 'Mã vai trò (Viết hoa, không dấu, viết liền)' })
  @IsString()
  @IsNotEmpty({ message: 'Mã vai trò không được để trống' })
  code: string;

  @ApiPropertyOptional({ example: 60, description: 'Trọng số cấp bậc (100: SuperAdmin, 80: Admin, 60: Manager, 40: Staff, 20: User)' })
  @IsOptional()
  @IsNumber({}, { message: 'Trọng số cấp bậc phải là số' })
  @Min(1, { message: 'Trọng số cấp bậc tối thiểu là 1' })
  level?: number;

  @ApiPropertyOptional({ example: 'Quản lý phụ trách các kho khu vực phía Nam', description: 'Mô tả vai trò' })
  @IsOptional()
  @IsString()
  description?: string;
}
