import { Test, TestingModule } from '@nestjs/testing';
import { EnginesController } from './engines.controller';
import { EnginesService } from './engines.service';

describe('EnginesController', () => {
  let controller: EnginesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnginesController],
      providers: [EnginesService],
    }).compile();

    controller = module.get<EnginesController>(EnginesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
