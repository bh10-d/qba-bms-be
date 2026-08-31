import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto, currentUser?: User): Promise<Role> {
    const existingName = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existingName) {
      throw new ConflictException('Tên vai trò đã tồn tại trong hệ thống');
    }

    const existingCode = await this.roleRepository.findOne({
      where: { code: createRoleDto.code.toUpperCase() },
    });
    if (existingCode) {
      throw new ConflictException('Mã vai trò đã tồn tại trong hệ thống');
    }

    const targetLevel = createRoleDto.level ?? 20;

    // Chống leo thang đặc quyền: Không cho phép tạo Role có Level >= Level của người khởi tạo (trừ SUPERADMIN)
    if (currentUser && currentUser.role?.code !== UserRole.SUPERADMIN) {
      const userLevel = currentUser.role?.level ?? 20;
      if (targetLevel >= userLevel) {
        throw new ForbiddenException(
          `Bạn không có quyền tạo vai trò có cấp bậc Level ${targetLevel} (phải nhỏ hơn cấp bậc hiện tại của bạn: Level ${userLevel})`,
        );
      }
    }

    const newRole = this.roleRepository.create({
      ...createRoleDto,
      code: createRoleDto.code.toUpperCase(),
      level: targetLevel,
    });

    return this.roleRepository.save(newRole);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { level: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy vai trò với ID #${id}`);
    }
    return role;
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { code: code.toUpperCase() } });
  }

  async update(
    id: number,
    updateRoleDto: UpdateRoleDto,
    currentUser?: User,
  ): Promise<Role> {
    const role = await this.findOne(id);

    // Kiểm tra quyền chỉnh sửa Role hiện tại
    if (currentUser && currentUser.role?.code !== UserRole.SUPERADMIN) {
      const userLevel = currentUser.role?.level ?? 20;

      // Không cho chỉnh sửa các Role có Level ngang hoặc cao hơn
      if (role.level >= userLevel) {
        throw new ForbiddenException(
          `Bạn không có quyền chỉnh sửa vai trò có cấp bậc Level ${role.level} (Ngang hoặc cao hơn Level ${userLevel} của bạn)`,
        );
      }

      // Không cho nâng Level mới lên >= userLevel
      if (updateRoleDto.level !== undefined && updateRoleDto.level >= userLevel) {
        throw new ForbiddenException(
          `Bạn không thể nâng cấp bậc vai trò lên Level ${updateRoleDto.level} (phải nhỏ hơn Level ${userLevel} của bạn)`,
        );
      }
    }

    if (updateRoleDto.code && updateRoleDto.code.toUpperCase() !== role.code) {
      const existingCode = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code.toUpperCase() },
      });
      if (existingCode) {
        throw new ConflictException('Mã vai trò mới đã bị trùng lặp');
      }
    }

    Object.assign(role, {
      ...updateRoleDto,
      code: updateRoleDto.code ? updateRoleDto.code.toUpperCase() : role.code,
    });

    return this.roleRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new BadRequestException('Không thể xóa vai trò hệ thống mặc định');
    }
    await this.roleRepository.remove(role);
  }
}
