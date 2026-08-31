import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

import { Order } from '../orders/entities/order.entity';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { Invoice } from '../accounting/entities/invoice.entity';
import { Product } from '../products/entities/product.entity';
import { ProductSupplierInfo } from '../supplier-info/entities/supplier-info.entity';
import { StockMove } from '../inventory/entities/stock-move.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      PurchaseOrder,
      Invoice,
      Product,
      ProductSupplierInfo,
      StockMove,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
