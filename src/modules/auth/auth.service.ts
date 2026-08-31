import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../../common/redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Đăng ký công khai luôn được mặc định gắn vai trò USER
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      fullName: registerDto.fullName,
      roleCode: UserRole.USER,
    });
    const token = this.generateToken(user);
    return {
      user,
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new BadRequestException('Tài khoản của bạn đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    delete user.password;
    const token = this.generateToken(user);

    return {
      user,
      accessToken: token,
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('Token không hợp lệ');
    }

    // Blacklist token trong Redis 7 ngày
    await this.redisService.set(`blacklist:${token}`, 'true', 7 * 24 * 60 * 60);
    return { message: 'Đăng xuất thành công' };
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.code || UserRole.USER,
    };
    return this.jwtService.sign(payload);
  }
}
