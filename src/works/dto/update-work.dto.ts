import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkDto } from './create-work.dto';
import { WorkStatus } from '../entities/work.entity';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateWorkDto extends PartialType(CreateWorkDto) {}

export class UpdateWorkStatusDto {
  @IsString({ message: '状态必须是字符串' })
  status: keyof typeof WorkStatus;
}

export class AddCategoryDto {
  @IsArray({ message: '分类ID必须是数组' })
  @IsNumber({}, { each: true, message: '分类ID必须是数字' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  categoryIds: number[];
}
