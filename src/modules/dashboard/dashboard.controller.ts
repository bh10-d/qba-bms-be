import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Dashboard (Thống kê tài chính & Tổng quan hệ thống)')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy toàn bộ số liệu thống kê tài chính, doanh thu, chi phí, tồn kho cho Trang Dashboard' })
  @ApiResponse({ status: 200, description: 'Số liệu thống kê Dashboard được trả về thành công.' })
  getStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('stats')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Alias API: Lấy số liệu thống kê Dashboard' })
  getStatsAlias() {
    return this.dashboardService.getDashboardStats();
  }
}
