import { NestFactory } from '@nestjs/core';
import { SeedModule } from '../seeds/seed.module';
import { SeedService } from '../seeds/seed.service';

async function runOdooMigration() {
  console.log('================================================================');
  console.log(' 🚀 [QBA BMS] BẮT ĐẦU MIGRATE TOÀN BỘ DỮ LIỆU TỪ CSDL ODOO (DUMP.SQL)');
  console.log('================================================================');

  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  try {
    const startTime = Date.now();
    await seedService.seed();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('----------------------------------------------------------------');
    console.log(` ✅ HOÀN TẤT MIGRATE 100% DỮ LIỆU ODOO TRONG ${duration} GIÂY!`);
    console.log('----------------------------------------------------------------');
  } catch (error) {
    console.error(' ❌ LỖI TRONG QUÁ TRÌNH MIGRATE DỮ LIỆU ODOO:', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

runOdooMigration();
