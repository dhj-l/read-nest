import { PartialType } from '@nestjs/mapped-types';
import { CreateBookCheckDto } from './create-book_check.dto';

export class UpdateBookCheckDto extends PartialType(CreateBookCheckDto) {}
