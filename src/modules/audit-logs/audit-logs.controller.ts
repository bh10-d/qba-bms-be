import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Audit Logs (Nhật ký lịch sử & Chatter Chatterbox Odoo)')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách nhật ký lịch sử theo Model & ID' })
  @ApiQuery({ name: 'resModel', required: true, example: 'PurchaseOrder', description: 'Tên Model thực thể (PurchaseOrder, Order, Product, Brand)' })
  @ApiQuery({ name: 'resId', required: true, example: 'P01455', description: 'Mã hoặc ID thực thể' })
  findByEntity(
    @Query('resModel') resModel: string,
    @Query('resId') resId: string,
  ) {
    return this.auditLogsService.findByEntity(resModel, resId);
  }

  @Get('purchase/:poNumber')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy nhật ký lịch sử Chatterbox của Đơn mua hàng theo Mã PO' })
  findByPoNumber(@Param('poNumber') poNumber: string) {
    return this.auditLogsService.findByPoNumber(poNumber);
  }
}
