import { PartialType } from '@nestjs/mapped-types';
import { CreateChapterCheckDto } from './create-chapter_check.dto';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { ChapterCheckStatus } from '../entities/chapter_check.entity';

export class UpdateChapterCheckDto extends PartialType(CreateChapterCheckDto) {
  @IsNotEmpty({ message: '请输入审核状态' })
  @IsNumber({}, { message: '审核状态必须是数字' })
  @IsIn([ChapterCheckStatus.Approved, ChapterCheckStatus.Rejected])
  status: number;
}
