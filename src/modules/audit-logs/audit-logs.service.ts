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

  async findAll(query?: {
    page?: number;
    limit?: number;
    search?: string;
    resModel?: string;
    resId?: string;
  }): Promise<{ data: AuditLog[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this.auditLogRepository.createQueryBuilder('log');

    if (query?.search) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(log.poNumber ILIKE :search OR log.authorName ILIKE :search OR log.body ILIKE :search OR log.resId ILIKE :search)',
        { search },
      );
    }

    if (query?.resModel) {
      qb.andWhere('log.resModel = :resModel', { resModel: query.resModel });
    }

    if (query?.resId) {
      qb.andWhere('(log.resId = :resId OR log.poNumber = :resId)', { resId: query.resId });
    }

    qb.orderBy('log.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
