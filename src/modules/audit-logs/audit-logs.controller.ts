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
  @ApiOperation({ summary: 'Lấy danh sách tất cả nhật ký lịch sử (Phân trang & Tìm kiếm)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'P01455' })
  @ApiQuery({ name: 'resModel', required: false, example: 'PurchaseOrder' })
  @ApiQuery({ name: 'resId', required: false, example: 'P01455' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('resModel') resModel?: string,
    @Query('resId') resId?: string,
  ) {
    if (!page && !limit && resModel && resId) {
      return this.auditLogsService.findByEntity(resModel, resId);
    }
    return this.auditLogsService.findAll({ page, limit, search, resModel, resId });
  }

  @Get('purchase/:poNumber')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy nhật ký lịch sử Chatterbox của Đơn mua hàng theo Mã PO' })
  findByPoNumber(@Param('poNumber') poNumber: string) {
    return this.auditLogsService.findByPoNumber(poNumber);
  }
}
