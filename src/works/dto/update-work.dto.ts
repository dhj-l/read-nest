import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkDto } from './create-work.dto';
import { WorkStatus } from '../entities/work.entity';
import { IsString } from 'class-validator';

export class UpdateWorkDto extends PartialType(CreateWorkDto) {}

export class UpdateWorkStatusDto {
  @IsString({ message: '状态必须是字符串' })
  status: keyof typeof WorkStatus;
}
