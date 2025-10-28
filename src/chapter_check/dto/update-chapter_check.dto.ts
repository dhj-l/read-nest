import { PartialType } from '@nestjs/mapped-types';
import { CreateChapterCheckDto } from './create-chapter_check.dto';

export class UpdateChapterCheckDto extends PartialType(CreateChapterCheckDto) {}
