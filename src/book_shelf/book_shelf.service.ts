import { Injectable } from '@nestjs/common';
import { CreateBookShelfDto } from './dto/create-book_shelf.dto';
import { UpdateBookShelfDto } from './dto/update-book_shelf.dto';

@Injectable()
export class BookShelfService {
  create(createBookShelfDto: CreateBookShelfDto) {
    return 'This action adds a new bookShelf';
  }

  findAll() {
    return `This action returns all bookShelf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookShelf`;
  }

  update(id: number, updateBookShelfDto: UpdateBookShelfDto) {
    return `This action updates a #${id} bookShelf`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookShelf`;
  }
}
