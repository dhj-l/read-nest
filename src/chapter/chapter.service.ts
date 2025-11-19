import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateChapterDto, FindChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { DataSource, Like, Repository, type FindOptionsWhere } from 'typeorm';
import { Work } from 'src/works/entities/work.entity';
import { Chapter } from './entities/chapter.entity';
import { ChapterCheck } from 'src/chapter_check/entities/chapter_check.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ChapterService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Chapter) private chapterRepository: Repository<Chapter>,
    @InjectRepository(Work) private workRepository: Repository<Work>,
  ) {}
  async create(workId: number, createChapterDto: CreateChapterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //获取作品
      const work = await queryRunner.manager.findOne(Work, {
        where: { id: workId },
        relations: ['user'],
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

  async findAll(work: Work | undefined, findChapterDto: FindChapterDto) {
    const { name = '', page = 1, pageSize = 10 } = findChapterDto;
    const { status } = findChapterDto;

    const condition: FindOptionsWhere<Chapter> = {
      name: Like(`%${name}%`),
    };
    // 状态筛选：仅当传入时生效
    if (status !== undefined) {
      condition.status = Number(status);
    }
    // 作品筛选：按作品ID筛选
    if (work) {
      condition.work = { id: work.id };
    }
    const [chapters, total] = await this.chapterRepository.findAndCount({
      where: condition,
      order: {
        id: 'ASC',
      },
      relations: ['work'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      chapters,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    try {
      const chapter = await this.chapterRepository.findOne({
        where: { id },
        relations: ['work'],
      });
      if (!chapter) {
        throw new BadRequestException('章节不存在');
      }
      // 增加章节阅读数
      chapter.work.readCount = (chapter.work.readCount ?? 0) + 1;
      await this.workRepository.save(chapter.work);
      return chapter;
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '查询失败',
      );
    }
  }

  async update(id: number, updateChapterDto: UpdateChapterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const chapter = await queryRunner.manager.findOne(Chapter, {
        where: { id },
        relations: ['work'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!chapter) {
        throw new BadRequestException('章节不存在');
      }
      const prevCount = chapter.count ?? 0;
      if (updateChapterDto.name !== undefined) {
        chapter.name = updateChapterDto.name;
      }
      if (updateChapterDto.content !== undefined) {
        chapter.content = updateChapterDto.content;
        chapter.count = updateChapterDto.content.length;
      }
      const delta = (chapter.count ?? 0) - prevCount;
      if (delta !== 0 && chapter.work) {
        chapter.work.count = (chapter.work.count ?? 0) + delta;
        await queryRunner.manager.save(Work, chapter.work);
      }
      const saved = await queryRunner.manager.save(Chapter, chapter);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(String(error));
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const chapter = await queryRunner.manager.findOne(Chapter, {
        where: { id },
        relations: ['work'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!chapter) {
        throw new BadRequestException('章节不存在');
      }
      if (chapter.work) {
        chapter.work.count = (chapter.work.count ?? 0) - (chapter.count ?? 0);
        await queryRunner.manager.save(Work, chapter.work);
      }
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from(ChapterCheck)
        .where('chapterId = :id', { id })
        .execute();
      await queryRunner.manager.remove(Chapter, chapter);
      await queryRunner.commitTransaction();
      return { id };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException(String(error));
    } finally {
      await queryRunner.release();
    }
  }
}
