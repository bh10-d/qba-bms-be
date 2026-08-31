import { Test, TestingModule } from '@nestjs/testing';
import { SupplierInfoController } from './supplier-info.controller';
import { SupplierInfoService } from './supplier-info.service';

describe('SupplierInfoController', () => {
  let controller: SupplierInfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierInfoController],
      providers: [SupplierInfoService],
    }).compile();

    controller = module.get<SupplierInfoController>(SupplierInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
