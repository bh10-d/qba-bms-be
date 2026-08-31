import { PartialType } from '@nestjs/mapped-types';
import { CreateGearboxDto } from './create-gearbox.dto';

export class UpdateGearboxDto extends PartialType(CreateGearboxDto) {}
