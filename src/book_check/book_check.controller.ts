import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookCheckService } from './book_check.service';
import { CreateBookCheckDto } from './dto/create-book_check.dto';
import { UpdateBookCheckDto } from './dto/update-book_check.dto';

@Controller('book-check')
export class BookCheckController {
  constructor(private readonly bookCheckService: BookCheckService) {}

  @Post()
  create(@Body() createBookCheckDto: CreateBookCheckDto) {
    return this.bookCheckService.create(createBookCheckDto);
  }

  @Get()
  findAll() {
    return this.bookCheckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookCheckService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookCheckDto: UpdateBookCheckDto) {
    return this.bookCheckService.update(+id, updateBookCheckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookCheckService.remove(+id);
  }
}
