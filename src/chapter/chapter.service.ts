import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { DataSource } from 'typeorm';
import { Work } from 'src/works/entities/work.entity';
import { Chapter } from './entities/chapter.entity';
import { ChapterCheck } from 'src/chapter_check/entities/chapter_check.entity';

@Injectable()
export class ChapterService {
  constructor(private dataSource: DataSource) {}
  async create(workId: number, createChapterDto: CreateChapterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //获取作品
      const work = await queryRunner.manager.findOne(Work, {
        where: { id: workId },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!work) {
        throw new BadRequestException('作品不存在');
      }

      //构建章节数据
      const chapterData = {
        ...createChapterDto,
        count: createChapterDto.content.length,
        work,
      };
      // 修改作品章节数
      work.count += chapterData.count;
      let chapter = queryRunner.manager.create(Chapter, chapterData);
      chapter = await queryRunner.manager.save(Chapter, chapter);
      //将记录添加到章节审核表
      const chapterCheck = queryRunner.manager.create(ChapterCheck, {
        user: work.user,
        chapter: chapter,
      });
      await queryRunner.manager.save(ChapterCheck, chapterCheck);
      await queryRunner.manager.save(Work, work);
      await queryRunner.commitTransaction();
      Reflect.set(chapter, 'username', work.user.username);
      Reflect.deleteProperty(chapter.work, 'user');
      return chapter;
    } catch (error: unknown) {
      // 回滚
      await queryRunner.rollbackTransaction();
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(String(error));
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all chapter`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chapter`;
  }

  update(id: number, _updateChapterDto: UpdateChapterDto) {
    void _updateChapterDto;
    return `This action updates a #${id} chapter`;
  }

  remove(id: number) {
    return `This action removes a #${id} chapter`;
  }
}
