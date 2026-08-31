import { Test, TestingModule } from '@nestjs/testing';
import { SupplierInfoService } from './supplier-info.service';

describe('SupplierInfoService', () => {
  let service: SupplierInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupplierInfoService],
    }).compile();

    service = module.get<SupplierInfoService>(SupplierInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
