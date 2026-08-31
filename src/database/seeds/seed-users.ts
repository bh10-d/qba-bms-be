import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  console.log('================================================================');
  console.log(' 🚀 [QBA BMS] BẮT ĐẦU SEED DUY NHẤT HỆ THỐNG QUYỀN & TÀI KHOẢN MẪU');
  console.log('================================================================');

  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  try {
    const res = await seedService.seedUsersOnly();
    console.log('----------------------------------------------------------------');
    console.log(' ✅ SEED TÀI KHOẢN MẪU THÀNH CÔNG:', res.users);
    console.log(' 🔑 Mật khẩu mặc định cho tất cả tài khoản: Password123!');
    console.log('----------------------------------------------------------------');
  } catch (error) {
    console.error(' ❌ LỖI KHI SEED TÀI KHOẢN:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
