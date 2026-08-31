import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
// import { ApiProperty } from '@nestjs/swagger';
// import { IsString } from 'class-validator';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
    // @ApiProperty({ description: 'Tên thương hiệu', example: 'Sinotruk HOWO' })
    // @IsString()
    // name?: string;
}
