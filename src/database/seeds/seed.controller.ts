import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Public } from '../../modules/auth/decorators/public.decorator';

@ApiTags('Seed Data (Dữ liệu mẫu)')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Khởi tạo dữ liệu mẫu (Users, Brands, Engines, Gearboxes, Vehicles, Products)' })
  async seedData() {
    await this.seedService.seed();
    return {
      message: 'Khởi tạo dữ liệu mẫu thành công!',
      sampleUsers: [
        { email: 'admin@qbabms.com', password: 'Password123!', role: 'ADMIN' },
        { email: 'manager@qbabms.com', password: 'Password123!', role: 'MANAGER' },
        { email: 'staff@qbabms.com', password: 'Password123!', role: 'STAFF' },
        { email: 'user@qbabms.com', password: 'Password123!', role: 'USER' },
      ],
    };
  }
}
