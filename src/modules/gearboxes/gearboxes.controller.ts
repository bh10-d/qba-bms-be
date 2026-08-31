import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GearboxesService } from './gearboxes.service';
import { CreateGearboxDto } from './dto/create-gearbox.dto';
import { UpdateGearboxDto } from './dto/update-gearbox.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Gearboxes (Hộp số)')
@ApiBearerAuth()
@Controller('gearboxes')
export class GearboxesController {
  constructor(private readonly gearboxesService: GearboxesService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo hộp số mới' })
  @ApiResponse({ status: 201, description: 'Hộp số đã được tạo thành công' })
  create(@Body() createGearboxDto: CreateGearboxDto) {
    return this.gearboxesService.create(createGearboxDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách tất cả hộp số' })
  @ApiResponse({ status: 200, description: 'Danh sách hộp số đã được lấy thành công' })
  findAll() {
    return this.gearboxesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy thông tin hộp số theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin hộp số đã được lấy thành công' })
  findOne(@Param('id') id: string) {
    return this.gearboxesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin hộp số theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin hộp số đã được cập nhật thành công' })
  update(@Param('id') id: string, @Body() updateGearboxDto: UpdateGearboxDto) {
    return this.gearboxesService.update(+id, updateGearboxDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa hộp số theo ID' })
  @ApiResponse({ status: 200, description: 'Hộp số đã được xóa thành công' })
  remove(@Param('id') id: string) {
    return this.gearboxesService.remove(+id);
  }
}
