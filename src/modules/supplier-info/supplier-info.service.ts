import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSupplierInfo } from './entities/supplier-info.entity';
import { CreateSupplierInfoDto } from './dto/create-supplier-info.dto';
import { UpdateSupplierInfoDto } from './dto/update-supplier-info.dto';
import { AttachmentsService } from '../attachments/attachments.service';

@Injectable()
export class SupplierInfoService {
  constructor(
    @InjectRepository(ProductSupplierInfo)
    private readonly supplierInfoRepository: Repository<ProductSupplierInfo>,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async create(createSupplierInfoDto: CreateSupplierInfoDto): Promise<ProductSupplierInfo> {
    const rawImg = createSupplierInfoDto.imageUrl || createSupplierInfoDto.logoUrl;

    if (rawImg && rawImg.startsWith('data:image/')) {
      const match = rawImg.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimetype = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        const fileMock: any = {
          originalname: `supplier_${createSupplierInfoDto.productCode || 'logo'}.${mimetype.split('/')[1]}`,
          buffer,
          mimetype,
          size: buffer.length,
        };
        const attachment = await this.attachmentsService.uploadFile(fileMock, 'ProductSupplierInfo');
        createSupplierInfoDto.imageUrl = attachment.rawUrl;
        createSupplierInfoDto.logoUrl = attachment.rawUrl;
      }
    } else if (rawImg) {
      createSupplierInfoDto.imageUrl = rawImg;
      createSupplierInfoDto.logoUrl = rawImg;
    }

    const newSupplierInfo = this.supplierInfoRepository.create(createSupplierInfoDto);
    return this.supplierInfoRepository.save(newSupplierInfo);
  }

  async findAll(query?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: ProductSupplierInfo[]; total: number; page: number; limit: number; totalPages: number }> {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 10));
    const skip = (page - 1) * limit;

    const qb = this.supplierInfoRepository
      .createQueryBuilder('info')
      .leftJoinAndSelect('info.product', 'product')
      .orderBy('info.id', 'ASC')
      .skip(skip)
      .take(limit);

    if (query?.search) {
      qb.andWhere(
        '(LOWER(info.supplierName) LIKE LOWER(:search) OR LOWER(info.productCode) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<ProductSupplierInfo> {
    const supplierInfo = await this.supplierInfoRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!supplierInfo) {
      throw new NotFoundException(`Không tìm thấy thông tin nhà cung cấp với ID #${id}`);
    }
    return supplierInfo;
  }

  async update(id: number, updateSupplierInfoDto: UpdateSupplierInfoDto): Promise<ProductSupplierInfo> {
    const supplierInfo = await this.findOne(id);
    const rawImg = updateSupplierInfoDto.imageUrl || updateSupplierInfoDto.logoUrl;

    if (rawImg && rawImg.startsWith('data:image/')) {
      const match = rawImg.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimetype = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        const fileMock: any = {
          originalname: `supplier_${supplierInfo.id}_logo.${mimetype.split('/')[1]}`,
          buffer,
          mimetype,
          size: buffer.length,
        };
        const attachment = await this.attachmentsService.uploadFile(fileMock, 'ProductSupplierInfo', String(supplierInfo.id));
        updateSupplierInfoDto.imageUrl = attachment.rawUrl;
        updateSupplierInfoDto.logoUrl = attachment.rawUrl;
      }
    } else if (rawImg) {
      updateSupplierInfoDto.imageUrl = rawImg;
      updateSupplierInfoDto.logoUrl = rawImg;
    }

    Object.assign(supplierInfo, updateSupplierInfoDto);
    return this.supplierInfoRepository.save(supplierInfo);
  }

  async remove(id: number): Promise<void> {
    const supplierInfo = await this.findOne(id);
    await this.supplierInfoRepository.remove(supplierInfo);
  }
}
