import { Injectable } from '@nestjs/common';
import { CreateBookCheckDto } from './dto/create-book_check.dto';
import { UpdateBookCheckDto } from './dto/update-book_check.dto';

@Injectable()
export class BookCheckService {
  create(createBookCheckDto: CreateBookCheckDto) {
    return 'This action adds a new bookCheck';
  }

  findAll() {
    return `This action returns all bookCheck`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookCheck`;
  }

  update(id: number, updateBookCheckDto: UpdateBookCheckDto) {
    return `This action updates a #${id} bookCheck`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookCheck`;
  }
}
