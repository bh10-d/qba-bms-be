import { Test, TestingModule } from '@nestjs/testing';
import { GearboxesService } from './gearboxes.service';

describe('GearboxesService', () => {
  let service: GearboxesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GearboxesService],
    }).compile();

    service = module.get<GearboxesService>(GearboxesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
