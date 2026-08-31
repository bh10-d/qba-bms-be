import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { AttachmentsService } from '../attachments/attachments.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    const existing = await this.brandRepository.findOne({
      where: { name: createBrandDto.name },
    });
    if (existing) {
      throw new ConflictException(`Thương hiệu ${createBrandDto.name} đã tồn tại`);
    }

    if (createBrandDto.logoUrl && createBrandDto.logoUrl.startsWith('data:image/')) {
      const match = createBrandDto.logoUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimetype = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        const fileMock: any = {
          originalname: `brand_${createBrandDto.name}_logo.${mimetype.split('/')[1]}`,
          buffer,
          mimetype,
          size: buffer.length,
        };
        const attachment = await this.attachmentsService.uploadFile(fileMock, 'Brand');
        createBrandDto.logoUrl = attachment.rawUrl;
      }
    }

    const newBrand = this.brandRepository.create(createBrandDto);
    return this.brandRepository.save(newBrand);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.products', 'product')
      .loadRelationCountAndMap('brand.productCount', 'brand.products')
      .orderBy('brand.name', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Brand> {
    const brand = await this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.products', 'product')
      .loadRelationCountAndMap('brand.productCount', 'brand.products')
      .where('brand.id = :id', { id })
      .getOne();

    if (!brand) {
      throw new NotFoundException(`Không tìm thấy thương hiệu với ID #${id}`);
    }
    return brand;
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      const existing = await this.brandRepository.findOne({
        where: { name: updateBrandDto.name },
      });
      if (existing) {
        throw new ConflictException(`Thương hiệu ${updateBrandDto.name} đã bị trùng lặp`);
      }
    }

    if (updateBrandDto.logoUrl && updateBrandDto.logoUrl.startsWith('data:image/')) {
      const match = updateBrandDto.logoUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimetype = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        const fileMock: any = {
          originalname: `brand_${brand.name}_logo.${mimetype.split('/')[1]}`,
          buffer,
          mimetype,
          size: buffer.length,
        };
        const attachment = await this.attachmentsService.uploadFile(fileMock, 'Brand', String(brand.id));
        updateBrandDto.logoUrl = attachment.rawUrl;
      }
    }

    Object.assign(brand, updateBrandDto);
    return this.brandRepository.save(brand);
  }

  async remove(id: number): Promise<void> {
    const brand = await this.findOne(id);
    if (brand.products && brand.products.length > 0) {
      throw new ConflictException(
        `Không thể xóa thương hiệu [${brand.name}] vì đang có ${brand.products.length} sản phẩm phụ tùng liên kết!`,
      );
    }
    await this.brandRepository.remove(brand);
  }
}
