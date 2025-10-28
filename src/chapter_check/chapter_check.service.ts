import { Injectable } from '@nestjs/common';
import { CreateChapterCheckDto } from './dto/create-chapter_check.dto';
import { UpdateChapterCheckDto } from './dto/update-chapter_check.dto';

@Injectable()
export class ChapterCheckService {
  create(createChapterCheckDto: CreateChapterCheckDto) {
    return 'This action adds a new chapterCheck';
  }

  findAll() {
    return `This action returns all chapterCheck`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chapterCheck`;
  }

  update(id: number, updateChapterCheckDto: UpdateChapterCheckDto) {
    return `This action updates a #${id} chapterCheck`;
  }

  remove(id: number) {
    return `This action removes a #${id} chapterCheck`;
  }
}
