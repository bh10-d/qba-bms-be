import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Engine } from './entities/engine.entity';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

@Injectable()
export class EnginesService {
  constructor(
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
  ) {}

  async create(createEngineDto: CreateEngineDto): Promise<Engine> {
    const newEngine = this.engineRepository.create(createEngineDto);
    return this.engineRepository.save(newEngine);
  }

  async findAll(): Promise<Engine[]> {
    return this.engineRepository
      .createQueryBuilder('engine')
      .leftJoinAndSelect('engine.products', 'product')
      .loadRelationCountAndMap('engine.productCount', 'engine.products')
      .orderBy('engine.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Engine> {
    const engine = await this.engineRepository
      .createQueryBuilder('engine')
      .leftJoinAndSelect('engine.products', 'product')
      .loadRelationCountAndMap('engine.productCount', 'engine.products')
      .where('engine.id = :id', { id })
      .getOne();

    if (!engine) {
      throw new NotFoundException(`Không tìm thấy động cơ với ID #${id}`);
    }
    return engine;
  }

  async update(id: number, updateEngineDto: UpdateEngineDto): Promise<Engine> {
    const engine = await this.findOne(id);
    Object.assign(engine, updateEngineDto);
    return this.engineRepository.save(engine);
  }

  async remove(id: number): Promise<void> {
    const engine = await this.findOne(id);
    if (engine.products && engine.products.length > 0) {
      throw new ConflictException(
        `Không thể xóa động cơ [${engine.name}] vì đang có ${engine.products.length} sản phẩm phụ tùng liên kết!`,
      );
    }
    await this.engineRepository.remove(engine);
  }
}
