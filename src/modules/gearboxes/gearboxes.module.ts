import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gearbox } from './entities/gearbox.entity';
import { GearboxesService } from './gearboxes.service';
import { GearboxesController } from './gearboxes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gearbox])],
  controllers: [GearboxesController],
  providers: [GearboxesService],
  exports: [GearboxesService, TypeOrmModule],
})
export class GearboxesModule {}
