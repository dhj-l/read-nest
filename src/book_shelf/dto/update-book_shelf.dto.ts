import { PartialType } from '@nestjs/mapped-types';
import { CreateBookShelfDto } from './create-book_shelf.dto';

export class UpdateBookShelfDto extends PartialType(CreateBookShelfDto) {}
