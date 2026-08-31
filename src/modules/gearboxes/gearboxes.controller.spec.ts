import { Test, TestingModule } from '@nestjs/testing';
import { GearboxesController } from './gearboxes.controller';
import { GearboxesService } from './gearboxes.service';

describe('GearboxesController', () => {
  let controller: GearboxesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GearboxesController],
      providers: [GearboxesService],
    }).compile();

    controller = module.get<GearboxesController>(GearboxesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
