import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const newVehicle = this.vehicleRepository.create(createVehicleDto);
    return this.vehicleRepository.save(newVehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.engine', 'engine')
      .leftJoinAndSelect('vehicle.gearbox', 'gearbox')
      .leftJoinAndSelect('vehicle.products', 'product')
      .loadRelationCountAndMap('vehicle.productCount', 'vehicle.products')
      .orderBy('vehicle.id', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.engine', 'engine')
      .leftJoinAndSelect('vehicle.gearbox', 'gearbox')
      .leftJoinAndSelect('vehicle.products', 'product')
      .loadRelationCountAndMap('vehicle.productCount', 'vehicle.products')
      .where('vehicle.id = :id', { id })
      .getOne();

    if (!vehicle) {
      throw new NotFoundException(`Không tìm thấy dòng xe với ID #${id}`);
    }
    return vehicle;
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: number): Promise<void> {
    const vehicle = await this.findOne(id);
    if (vehicle.products && vehicle.products.length > 0) {
      throw new ConflictException(
        `Không thể xóa dòng xe [${vehicle.name}] vì đang có ${vehicle.products.length} sản phẩm phụ tùng liên kết!`,
      );
    }
    await this.vehicleRepository.remove(vehicle);
  }
}
