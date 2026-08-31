import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AttachmentsService } from '../attachments/attachments.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findOne({
      where: { defaultCode: createProductDto.defaultCode },
    });
    if (existing) {
      throw new ConflictException(`Mã phụ tùng ${createProductDto.defaultCode} đã tồn tại trong hệ thống`);
    }

    if (createProductDto.imageUrl && createProductDto.imageUrl.startsWith('data:image/')) {
      const match = createProductDto.imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimetype = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        const fileMock: any = {
          originalname: `product_${createProductDto.defaultCode || 'img'}.${mimetype.split('/')[1]}`,
          buffer,
          mimetype,
          size: buffer.length,
        };
        const attachment = await this.attachmentsService.uploadFile(fileMock, 'Product');
        createProductDto.imageUrl = attachment.rawUrl;
      }
    }

    const newProduct = this.productRepository.create(createProductDto);
    return this.productRepository.save(newProduct);
  }

  async findAll(): Promise<any[]> {
    const products = await this.productRepository.find({
      relations: ['brand', 'vehicles', 'engines', 'gearboxes', 'supplierInfos'],
      order: { id: 'ASC' },
    });

    const stockMap: Record<number, number> = {};
    try {
      const stockSums = await this.productRepository.manager
        .createQueryBuilder()
        .select('sm.product_id', 'productId')
        .addSelect('SUM(sm.quantity)', 'totalStock')
        .from('stock_moves', 'sm')
        .groupBy('sm.product_id')
        .getRawMany();

      for (const s of stockSums) {
        if (s.productId) {
          stockMap[s.productId] = Number(s.totalStock) || 0;
        }
      }
    } catch (e) {}

    return products.map((p) => {
      const stock = stockMap[p.id] || 0;
      return {
        ...p,
        currentStock: stock,
        qtyOnHand: stock,
        quantity: stock,
      };
    });
  }

  async findOne(id: number): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'vehicles', 'engines', 'gearboxes', 'supplierInfos'],
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm phụ tùng với ID #${id}`);
    }

    let stock = 0;
    try {
      const res = await this.productRepository.manager
        .createQueryBuilder()
        .select('SUM(sm.quantity)', 'sum')
        .from('stock_moves', 'sm')
        .where('sm.product_id = :id', { id })
        .getRawOne();
      stock = Number(res?.sum) || 0;
    } catch (e) {}

    return {
      ...product,
      currentStock: stock,
      qtyOnHand: stock,
      quantity: stock,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (updateProductDto.defaultCode && updateProductDto.defaultCode !== product.defaultCode) {
      const existing = await this.productRepository.findOne({
        where: { defaultCode: updateProductDto.defaultCode },
      });
      if (existing) {
        throw new ConflictException(`Mã phụ tùng ${updateProductDto.defaultCode} đã bị trùng lặp`);
      }
    }

    if (updateProductDto.imageUrl && updateProductDto.imageUrl.startsWith('data:image/')) {
      const match = updateProductDto.imageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        const mimetype = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        const fileMock: any = {
          originalname: `product_${product.id}_${mimetype.split('/')[1]}`,
          buffer,
          mimetype,
          size: buffer.length,
        };
        const attachment = await this.attachmentsService.uploadFile(fileMock, 'Product', String(product.id));
        updateProductDto.imageUrl = attachment.rawUrl;
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
