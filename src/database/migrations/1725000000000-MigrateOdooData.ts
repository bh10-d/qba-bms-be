import { MigrationInterface, QueryRunner } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from '../seeds/seed.module';
import { SeedService } from '../seeds/seed.service';

export class MigrateOdooData1725000000000 implements MigrationInterface {
  name = 'MigrateOdooData1725000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🚀 [Migration] Bắt đầu Nạp & Migrate toàn bộ CSDL Odoo sang PostgreSQL...');
    const app = await NestFactory.createApplicationContext(SeedModule);
    const seedService = app.get(SeedService);

    try {
      await seedService.seed();
      console.log('✅ [Migration] Migrate 100% dữ liệu Odoo thành công!');
    } catch (error) {
      console.error('❌ [Migration] Lỗi trong quá trình nạp dữ liệu Odoo:', error);
      throw error;
    } finally {
      await app.close();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 [Migration Rollback] Truncate dọn dẹp các bảng dữ liệu đã nạp...');
    await queryRunner.query(
      `TRUNCATE TABLE "audit_logs", "stock_moves", "stock_pickings", "orders", "order_items", "purchase_orders", "purchase_items", "accounting_invoices", "accounting_invoice_items", "accounting_journal_entries", "accounting_journal_items", "accounting_payments", "product_supplier_info", "products", "brands", "engines", "gearboxes", "vehicles" CASCADE;`,
    );
  }
}
