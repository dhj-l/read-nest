import { Injectable } from '@nestjs/common';
import { UpdateBookCheckDto } from './dto/update-book_check.dto';
import type { CreateBookCheckType } from './type/type';
import { InjectRepository } from '@nestjs/typeorm';
import { BookCheck } from './entities/book_check.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BookCheckService {
  constructor(
    @InjectRepository(BookCheck)
    private bookCheckRepository: Repository<BookCheck>,
  ) {}
  async create(createBookCheckDto: CreateBookCheckType) {
    const bookCheck = this.bookCheckRepository.create(createBookCheckDto);
    return this.bookCheckRepository.save(bookCheck);
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
