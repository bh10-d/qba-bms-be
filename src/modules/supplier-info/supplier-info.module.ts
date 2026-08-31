import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSupplierInfo } from './entities/supplier-info.entity';
import { SupplierInfoService } from './supplier-info.service';
import { SupplierInfoController } from './supplier-info.controller';
import { AttachmentsModule } from '../attachments/attachments.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSupplierInfo]), AttachmentsModule],
  controllers: [SupplierInfoController],
  providers: [SupplierInfoService],
  exports: [SupplierInfoService, TypeOrmModule],
})
export class SupplierInfoModule {}
