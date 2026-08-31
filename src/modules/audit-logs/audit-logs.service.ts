import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(data: {
    resModel: string;
    resId: string;
    poNumber?: string;
    authorName?: string;
    action?: string;
    body?: string;
    trackingValues?: Record<string, any>[];
    createdAt?: Date;
  }): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      resModel: data.resModel,
      resId: data.resId,
      poNumber: data.poNumber,
      authorName: data.authorName || 'NV- KT KHO',
      action: data.action || 'UPDATE',
      body: data.body,
      trackingValues: data.trackingValues,
      createdAt: data.createdAt || new Date(),
    });
    return this.auditLogRepository.save(log);
  }

  async findByEntity(resModel: string, resId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: [
        { resModel, resId },
        { poNumber: resId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPoNumber(poNumber: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: [
        { poNumber },
        { resId: poNumber },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
