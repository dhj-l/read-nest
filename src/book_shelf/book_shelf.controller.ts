import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BookShelfService } from './book_shelf.service';
import { CreateBookShelfDto } from './dto/create-book_shelf.dto';
import { UpdateBookShelfDto } from './dto/update-book_shelf.dto';

@Controller('book-shelf')
export class BookShelfController {
  constructor(private readonly bookShelfService: BookShelfService) {}

  @Post()
  create(@Body() createBookShelfDto: CreateBookShelfDto) {
    return this.bookShelfService.create(createBookShelfDto);
  }

  @Get()
  findAll() {
    return this.bookShelfService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookShelfService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookShelfDto: UpdateBookShelfDto,
  ) {
    return this.bookShelfService.update(+id, updateBookShelfDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookShelfService.remove(+id);
  }
}
