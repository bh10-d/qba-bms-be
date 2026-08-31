import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Attachment } from './entities/attachment.entity';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    private readonly storageService: StorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    resModel?: string,
    resId?: string,
  ): Promise<Attachment & { rawUrl: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng chọn một file hợp lệ!');
    }

    // 1. Tính mã SHA1 Checksum hash của nội dung file (Cơ chế Odoo)
    const checksum = crypto.createHash('sha1').update(file.buffer).digest('hex');
    const prefix = checksum.slice(0, 2);
    const storeKey = `filestore/${prefix}/${checksum}`;

    // 2. Kiểm tra xem file đã tồn tại trên Storage Engine (@bh10-d/storix) chưa
    const isStored = await this.storageService.exists(storeKey);
    if (!isStored) {
      this.logger.log(`--> [Storix] Lưu tệp mới lên Storage Engine: ${storeKey}`);
      await this.storageService.put({
        key: storeKey,
        content: file.buffer,
        contentType: file.mimetype,
      });
    } else {
      this.logger.log(`--> [Odoo Deduplication] Tệp với SHA1 [${checksum}] đã tồn tại, dùng lại tệp cũ!`);
    }

    // 3. Tạo bản ghi Attachment trong PostgreSQL
    const attachment = this.attachmentRepository.create({
      name: file.originalname,
      checksum,
      storeKey,
      mimetype: file.mimetype,
      fileSize: file.size,
      resModel: resModel || undefined,
      resId: resId ? String(resId) : undefined,
    });

    const savedAttachment = await this.attachmentRepository.save(attachment);
    const rawUrl = `/api/v1/attachments/${savedAttachment.id}/raw`;

    return {
      ...savedAttachment,
      rawUrl,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    resModel?: string,
    resId?: string,
  ): Promise<Array<Attachment & { rawUrl: string }>> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất 1 file!');
    }

    const results: Array<Attachment & { rawUrl: string }> = [];
    for (const f of files) {
      const item = await this.uploadFile(f, resModel, resId);
      results.push(item);
    }
    return results;
  }

  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) {
      throw new NotFoundException(`Không tìm thấy Attachment với ID #${id}`);
    }
    return attachment;
  }

  async getFileStream(id: string) {
    const attachment = await this.findOne(id);
    const stream = await this.storageService.get(attachment.storeKey);
    return {
      stream,
      attachment,
    };
  }

  async findByModel(resModel: string, resId: string): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { resModel, resId: String(resId) },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const attachment = await this.findOne(id);
    const checksum = attachment.checksum;

    // Xóa bản ghi trong database
    await this.attachmentRepository.remove(attachment);

    // Kiểm tra xem còn bản ghi nào khác dùng chung file SHA1 hash này không
    const remainingCount = await this.attachmentRepository.count({
      where: { checksum },
    });

    if (remainingCount === 0) {
      this.logger.log(`--> [Storix] Xóa tệp thực tế khỏi Storage Engine: ${attachment.storeKey}`);
      try {
        await this.storageService.delete(attachment.storeKey);
      } catch (err) {
        this.logger.warn(`Lỗi khi xóa file khỏi storage: ${err.message}`);
      }
    }
  }
}
