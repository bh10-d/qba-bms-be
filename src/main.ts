import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cấu hình phục vụ file tĩnh cho thư mục uploads
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const globalPrefix = process.env.GLOBAL_PREFIX ?? 'api/v1';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
    .setTitle('QBA BMS API')
    .setDescription('API documentation for QBA BMS System')
    .setVersion(process.env.VERSION ?? '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Dán chuỗi accessToken nhận được từ API login (Lưu ý: Không gõ chữ "Bearer ", Swagger sẽ tự động thêm)',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Auth (Xác thực người dùng)')
    .addTag('Users (Người dùng)')
    .addTag('Brands (Thương hiệu)')
    .addTag('Engines (Động cơ)')
    .addTag('Gearboxes (Hộp số)')
    .addTag('Vehicles (Dòng xe)')
    .addTag('Products (Phụ tùng / Sản phẩm)')
    .addTag('Supplier Info (Thông tin nhà cung cấp)')
    .addTag('Attachments (Quản lý Tệp Đính Kèm - Cơ chế Odoo)')
    .addTag('Orders (Đơn Bán Hàng & Báo Giá)')
    .addTag('Purchases (Đơn Mua Hàng & Đặt Hàng NCC)')
    .addTag('Inventory (Quản Lý Kho & Tồn Kho Real-time)')
    .addTag('Labels (Wizard Tạo tem sản phẩm)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = process.env.SWAGGER_PATH ?? 'api/v1/docs';
  SwaggerModule.setup(swaggerPath, app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`===========================================================================`);
  logger.log(`🚀 QBA BMS Backend API is running on: http://localhost:${port}/${globalPrefix}`);
  logger.log(`📚 OpenAPI / Swagger UI Documentation: http://localhost:${port}/${swaggerPath}`);
  logger.log(`📁 Static Assets / Uploads served at: http://localhost:${port}/uploads/`);
  logger.log(`===========================================================================`);
}
bootstrap();
