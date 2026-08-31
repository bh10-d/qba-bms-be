import { Test, TestingModule } from '@nestjs/testing';
import { EnginesService } from './engines.service';

describe('EnginesService', () => {
  let service: EnginesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnginesService],
    }).compile();

    service = module.get<EnginesService>(EnginesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
