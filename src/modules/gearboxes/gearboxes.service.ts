import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gearbox } from './entities/gearbox.entity';
import { CreateGearboxDto } from './dto/create-gearbox.dto';
import { UpdateGearboxDto } from './dto/update-gearbox.dto';

@Injectable()
export class GearboxesService {
  constructor(
    @InjectRepository(Gearbox)
    private readonly gearboxRepository: Repository<Gearbox>,
  ) {}

  async create(createGearboxDto: CreateGearboxDto): Promise<Gearbox> {
    const newGearbox = this.gearboxRepository.create(createGearboxDto);
    return this.gearboxRepository.save(newGearbox);
  }

  async findAll(): Promise<Gearbox[]> {
    return this.gearboxRepository
      .createQueryBuilder('gearbox')
      .leftJoinAndSelect('gearbox.products', 'product')
      .loadRelationCountAndMap('gearbox.productCount', 'gearbox.products')
      .orderBy('gearbox.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Gearbox> {
    const gearbox = await this.gearboxRepository
      .createQueryBuilder('gearbox')
      .leftJoinAndSelect('gearbox.products', 'product')
      .loadRelationCountAndMap('gearbox.productCount', 'gearbox.products')
      .where('gearbox.id = :id', { id })
      .getOne();

    if (!gearbox) {
      throw new NotFoundException(`Không tìm thấy hộp số với ID #${id}`);
    }
    return gearbox;
  }

  async update(id: number, updateGearboxDto: UpdateGearboxDto): Promise<Gearbox> {
    const gearbox = await this.findOne(id);
    Object.assign(gearbox, updateGearboxDto);
    return this.gearboxRepository.save(gearbox);
  }

  async remove(id: number): Promise<void> {
    const gearbox = await this.findOne(id);
    if (gearbox.products && gearbox.products.length > 0) {
      throw new ConflictException(
        `Không thể xóa hộp số [${gearbox.name}] vì đang có ${gearbox.products.length} sản phẩm phụ tùng liên kết!`,
      );
    }
    await this.gearboxRepository.remove(gearbox);
  }
}
