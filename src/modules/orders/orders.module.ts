import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountingModule } from '../accounting/accounting.module';
import { PdfExporterService } from '../../common/pdf/pdf-exporter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    InventoryModule,
    AccountingModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PdfExporterService],
  exports: [OrdersService, PdfExporterService, TypeOrmModule],
})
export class OrdersModule {}
