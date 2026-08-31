import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';

import { RedisModule } from './common/redis/redis.module';
import { StorageModule } from './common/storage/storage.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { BrandsModule } from './modules/brands/brands.module';
import { EnginesModule } from './modules/engines/engines.module';
import { GearboxesModule } from './modules/gearboxes/gearboxes.module';
import { LabelsModule } from './modules/labels/labels.module';
import { ProductsModule } from './modules/products/products.module';
import { SupplierInfoModule } from './modules/supplier-info/supplier-info.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SeedModule } from './database/seeds/seed.module';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'qba_bms'),
        autoLoadEntities: true,
        synchronize: true, // Tự động đồng bộ schema CSDL trong môi trường Dev
      }),
    }),
    RedisModule,
    StorageModule,
    AuthModule,
    UsersModule,
    RolesModule,
    BrandsModule,
    EnginesModule,
    GearboxesModule,
    LabelsModule,
    ProductsModule,
    SupplierInfoModule,
    VehiclesModule,
    AccountingModule,
    AttachmentsModule,
    InventoryModule,
    OrdersModule,
    PurchasesModule,
    AuditLogsModule,
    DashboardModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
