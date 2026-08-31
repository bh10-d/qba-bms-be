import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@ApiTags('Labels (Wizard Tạo tem sản phẩm)')
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) { }

  @Post()
  @ApiOperation({ summary: 'Tạo nhãn hiệu mới' })
  @ApiResponse({ status: 201, description: 'Nhãn hiệu đã được tạo thành công' })
  create(@Body() createLabelDto: CreateLabelDto) {
    return this.labelsService.create(createLabelDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Lấy danh sách tất cả nhãn hiệu' })
  // @ApiResponse({ status: 200, description: 'Danh sách nhãn hiệu đã được lấy thành công' })
  // findAll() {
  //   return this.labelsService.findAll();
  // }

  // @Get(':id')
  // @ApiOperation({ summary: 'Lấy thông tin nhãn hiệu theo ID' })
  // @ApiResponse({ status: 200, description: 'Thông tin nhãn hiệu đã được lấy thành công' })
  // findOne(@Param('id') id: string) {
  //   return this.labelsService.findOne(+id);
  // }

  // @Patch(':id')
  // @ApiOperation({ summary: 'Cập nhật thông tin nhãn hiệu theo ID' })
  // @ApiResponse({ status: 200, description: 'Thông tin nhãn hiệu đã được cập nhật thành công' })
  // update(@Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto) {
  //   return this.labelsService.update(+id, updateLabelDto);
  // }

  // @Delete(':id')
  // @ApiOperation({ summary: 'Xóa nhãn hiệu theo ID' })
  // @ApiResponse({ status: 200, description: 'Nhãn hiệu đã được xóa thành công' })
  // remove(@Param('id') id: string) {
  //   return this.labelsService.remove(+id);
  // }
}
