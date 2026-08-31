import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierInfoDto } from './create-supplier-info.dto';

export class UpdateSupplierInfoDto extends PartialType(CreateSupplierInfoDto) {}
