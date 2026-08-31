import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnginesService } from './engines.service';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';
import { Engine } from './entities/engine.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Engines (Động cơ)')
@ApiBearerAuth()
@Controller('engines')
export class EnginesController {
  constructor(private readonly enginesService: EnginesService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo động cơ mới' })
  @ApiResponse({ status: 201, type: Engine })
  create(@Body() createEngineDto: CreateEngineDto) {
    return this.enginesService.create(createEngineDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách tất cả động cơ' })
  @ApiResponse({ status: 200, type: [Engine] })
  findAll() {
    return this.enginesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy thông tin động cơ theo ID' })
  @ApiResponse({ status: 200, type: Engine })
  findOne(@Param('id') id: string) {
    return this.enginesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin động cơ theo ID' })
  @ApiResponse({ status: 200, type: Engine })
  update(@Param('id') id: string, @Body() updateEngineDto: UpdateEngineDto) {
    return this.enginesService.update(+id, updateEngineDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa động cơ theo ID' })
  @ApiResponse({ status: 200, description: 'Động cơ đã được xóa thành công' })
  remove(@Param('id') id: string) {
    return this.enginesService.remove(+id);
  }
}
