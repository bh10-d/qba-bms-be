import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import databaseConfig from '../../config/database.config';
import redisConfig from '../../config/redis.config';
import jwtConfig from '../../config/jwt.config';

import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { Brand } from '../../modules/brands/entities/brand.entity';
import { Engine } from '../../modules/engines/entities/engine.entity';
import { Gearbox } from '../../modules/gearboxes/entities/gearbox.entity';
import { Vehicle } from '../../modules/vehicles/entities/vehicle.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductDocument } from '../../modules/products/entities/product-document.entity';
import { ProductSupplierInfo } from '../../modules/supplier-info/entities/supplier-info.entity';
import { Attachment } from '../../modules/attachments/entities/attachment.entity';
import { Account } from '../../modules/accounting/entities/account.entity';
import { Invoice } from '../../modules/accounting/entities/invoice.entity';
import { InvoiceItem } from '../../modules/accounting/entities/invoice-item.entity';
import { JournalEntry } from '../../modules/accounting/entities/journal-entry.entity';
import { JournalItem } from '../../modules/accounting/entities/journal-item.entity';
import { Payment } from '../../modules/accounting/entities/payment.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { OrderItem } from '../../modules/orders/entities/order-item.entity';
import { PurchaseOrder } from '../../modules/purchases/entities/purchase-order.entity';
import { PurchaseItem } from '../../modules/purchases/entities/purchase-item.entity';
import { StockMove } from '../../modules/inventory/entities/stock-move.entity';
import { StockPicking } from '../../modules/inventory/entities/stock-picking.entity';
import { AuditLog } from '../../modules/audit-logs/entities/audit-log.entity';

import { OrdersModule } from '../../modules/orders/orders.module';
import { PurchasesModule } from '../../modules/purchases/purchases.module';
import { InventoryModule } from '../../modules/inventory/inventory.module';
import { AccountingModule } from '../../modules/accounting/accounting.module';
import { AuditLogsModule } from '../../modules/audit-logs/audit-logs.module';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

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
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Brand,
      Engine,
      Gearbox,
      Vehicle,
      Product,
      ProductDocument,
      ProductSupplierInfo,
      Attachment,
      Account,
      Invoice,
      InvoiceItem,
      JournalEntry,
      JournalItem,
      Payment,
      Order,
      OrderItem,
      PurchaseOrder,
      PurchaseItem,
      StockMove,
      StockPicking,
      AuditLog,
    ]),
    OrdersModule,
    PurchasesModule,
    InventoryModule,
    AccountingModule,
    AuditLogsModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
