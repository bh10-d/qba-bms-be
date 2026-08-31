import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { AttachmentsService } from './attachments.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Attachments (Quản lý Tệp Đính Kèm - Cơ chế Odoo)')
@ApiBearerAuth()
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Tải lên tệp đính kèm mới (Dùng mã SHA1 Checksum chống trùng lặp kiểu Odoo)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Tệp đính kèm (Ảnh, PDF, Doc...)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('resModel') resModel?: string,
    @Query('resId') resId?: string,
  ) {
    return this.attachmentsService.uploadFile(file, resModel, resId);
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Tải lên hàng loạt nhiều tệp đính kèm cùng lúc' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Danh sách nhiều tệp đính kèm',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('resModel') resModel?: string,
    @Query('resId') resId?: string,
  ) {
    return this.attachmentsService.uploadMultipleFiles(files, resModel, resId);
  }

  @Public()
  @Get(':id/raw')
  @ApiOperation({ summary: 'Stream trực tiếp tệp từ Storix Engine về trình duyệt (Công khai xem ảnh / Tải file)' })
  async getRawFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { stream, attachment } = await this.attachmentsService.getFileStream(id);

    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Length', attachment.fileSize);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', `"${attachment.checksum}"`);

    stream.pipe(res);
  }

  @Get('model/:resModel/:resId')
  @ApiOperation({ summary: 'Lấy danh sách tệp đính kèm theo Model và Record ID' })
  findByModel(
    @Param('resModel') resModel: string,
    @Param('resId') resId: string,
  ) {
    return this.attachmentsService.findByModel(resModel, resId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tệp đính kèm theo ID' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attachmentsService.remove(id);
  }
}
