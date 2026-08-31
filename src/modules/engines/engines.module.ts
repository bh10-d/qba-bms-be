import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Engine } from './entities/engine.entity';
import { EnginesService } from './engines.service';
import { EnginesController } from './engines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Engine])],
  controllers: [EnginesController],
  providers: [EnginesService],
  exports: [EnginesService, TypeOrmModule],
})
export class EnginesModule {}
