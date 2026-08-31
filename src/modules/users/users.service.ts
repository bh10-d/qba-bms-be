import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(
    createUserDto: CreateUserDto & { roleCode?: string },
    currentUser?: User,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    let role: Role | null = null;
    if (createUserDto.roleId) {
      role = await this.roleRepository.findOne({ where: { id: createUserDto.roleId } });
    } else if (createUserDto.roleCode) {
      role = await this.roleRepository.findOne({
        where: { code: createUserDto.roleCode.toUpperCase() },
      });
    }

    // Nếu không chỉ định vai trò, gán vai trò mặc định USER
    if (!role) {
      role = await this.roleRepository.findOne({ where: { code: UserRole.USER } });
    }

    // Chống leo thang đặc quyền: Không cho phép gán vai trò có Level >= Level của người khởi tạo (trừ SUPERADMIN)
    if (currentUser && currentUser.role?.code !== UserRole.SUPERADMIN) {
      const userLevel = currentUser.role?.level ?? 20;
      const targetRoleLevel = role?.level ?? 20;

      if (targetRoleLevel >= userLevel) {
        throw new ForbiddenException(
          `Bạn không thể gán vai trò [${role?.name}] (Level ${targetRoleLevel}) có cấp bậc bằng hoặc cao hơn vai trò của bạn (Level ${userLevel})`,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      avatarUrl: createUserDto.avatarUrl || undefined,
      password: hashedPassword,
      role: role || undefined,
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
    });

    const savedUser = await this.userRepository.save(newUser);
    delete savedUser.password;
    return savedUser;
  }

  async findAll(currentUser?: User): Promise<User[]> {
    if (!currentUser || !currentUser.role) {
      return this.userRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    // Query động trực tiếp từ CSDL Postgres: Lấy các user có role.level <= currentLevel của người request
    const currentLevel = currentUser.role.level ?? 20;

    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('role.level <= :currentLevel', { currentLevel })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với id #${id}`);
    }
    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: User,
  ): Promise<User> {
    const user = await this.findOne(id);

    // Kiểm tra quyền chỉnh sửa User
    if (currentUser && currentUser.role?.code !== UserRole.SUPERADMIN) {
      const userLevel = currentUser.role?.level ?? 20;
      const targetUserLevel = user.role?.level ?? 20;

      // Không cho phép chỉnh sửa người dùng có cấp bậc ngang hoặc cao hơn
      if (targetUserLevel >= userLevel) {
        throw new ForbiddenException(
          `Bạn không thể chỉnh sửa người dùng có cấp bậc Level ${targetUserLevel} (Ngang hoặc cao hơn Level ${userLevel} của bạn)`,
        );
      }
    }

    // Nếu thay đổi Vai trò mới cho User
    if (updateUserDto.roleId || updateUserDto.roleCode) {
      let newRole: Role | null = null;
      if (updateUserDto.roleId) {
        newRole = await this.roleRepository.findOne({ where: { id: updateUserDto.roleId } });
      } else if (updateUserDto.roleCode) {
        newRole = await this.roleRepository.findOne({ where: { code: updateUserDto.roleCode.toUpperCase() } });
      }

      if (newRole) {
        if (currentUser && currentUser.role?.code !== UserRole.SUPERADMIN) {
          const userLevel = currentUser.role?.level ?? 20;
          if (newRole.level >= userLevel) {
            throw new ForbiddenException(
              `Bạn không thể gán vai trò mới [${newRole.name}] (Level ${newRole.level}) ngang hoặc cao hơn cấp bậc của bạn (Level ${userLevel})`,
            );
          }
        }
        user.role = newRole;
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.fullName !== undefined) user.fullName = updateUserDto.fullName;
    if (updateUserDto.avatarUrl !== undefined) user.avatarUrl = updateUserDto.avatarUrl;
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;

    const updatedUser = await this.userRepository.save(user);
    delete updatedUser.password;
    return updatedUser;
  }

  async toggleLock(id: string, currentUser?: User): Promise<User> {
    const user = await this.findOne(id);

    if (currentUser) {
      // Không tự khóa tài khoản của chính mình
      if (currentUser.id === user.id) {
        throw new BadRequestException('Bạn không thể tự khóa tài khoản của chính mình!');
      }

      // Không thể khóa tài khoản có Level ngang hoặc cao hơn (trừ SUPERADMIN)
      if (currentUser.role?.code !== UserRole.SUPERADMIN) {
        const userLevel = currentUser.role?.level ?? 20;
        const targetUserLevel = user.role?.level ?? 20;

        if (targetUserLevel >= userLevel) {
          throw new ForbiddenException(
            `Bạn không thể khóa/mở khóa tài khoản của người dùng có cấp bậc Level ${targetUserLevel} (Ngang hoặc cao hơn Level ${userLevel} của bạn)`,
          );
        }
      }
    }

    user.isActive = !user.isActive;
    const updatedUser = await this.userRepository.save(user);
    delete updatedUser.password;
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
