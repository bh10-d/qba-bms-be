import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalItem } from './entities/journal-item.entity';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { PurchaseOrder } from '../purchases/entities/purchase-order.entity';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Invoice,
      InvoiceItem,
      JournalEntry,
      JournalItem,
      Payment,
      Order,
      PurchaseOrder,
    ]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
