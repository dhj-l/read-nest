import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChapterCheckDto } from './dto/create-chapter_check.dto';
import { UpdateChapterCheckDto } from './dto/update-chapter_check.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter, ChapterStatus } from 'src/chapter/entities/chapter.entity';
import { And, In, Repository, DataSource } from 'typeorm';
import {
  ChapterCheck,
  ChapterCheckStatus,
} from './entities/chapter_check.entity';
import { Work, WorkStatus } from 'src/works/entities/work.entity';

@Injectable()
export class ChapterCheckService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    @InjectRepository(ChapterCheck)
    private chapterCheckRepository: Repository<ChapterCheck>,
    @InjectRepository(Work)
    private workRepository: Repository<Work>,
  ) {}
  async create(
    createChapterCheckDto: CreateChapterCheckDto,
    user: { username: string; sub: number },
  ) {
    const { chapterId } = createChapterCheckDto;
    //查询相关章节
    const chapter = await this.chapterRepository.findOne({
      where: {
        id: chapterId,
      },
      relations: {
        work: {
          user: true,
        },
      },
    });
    if (!chapter) {
      throw new BadRequestException('相关章节不存在');
    }
    const userId = chapter.work.user.id;
    if (userId !== user.sub) {
      throw new UnauthorizedException('您不是此章节的作者，不能添加审核章节');
    }
    //判断审核章节中是否存在相同章节审核并且状态为待审核
    const chapterCheck = await this.chapterCheckRepository.findOne({
      where: {
        chapter: {
          id: chapterId,
        },
        status: In([ChapterCheckStatus.Pending, ChapterCheckStatus.Approved]),
      },
    });

    if (chapterCheck) {
      throw new BadRequestException('该章节已存在待审核记录或已通过审核');
    }

    //添加章节审核记录
    const data = this.chapterCheckRepository.create({
      user: chapter?.work.user,
      chapter,
    });

    const result = await this.chapterCheckRepository.save(data);
    Reflect.deleteProperty(result, 'user');
    Reflect.deleteProperty(result.chapter, 'work');
    return result;
  }

  async findAll(query: { status?: number; page?: number; pageSize?: number }) {
    const { status, page = 1, pageSize = 10 } = query;

    const qb = this.chapterCheckRepository
      .createQueryBuilder('chapter_check')
      .leftJoinAndSelect('chapter_check.user', 'user')
      .leftJoinAndSelect('chapter_check.chapter', 'chapter')
      .leftJoinAndSelect('chapter.work', 'work')
      .select([
        'chapter_check.id',
        'chapter_check.status',
        'chapter_check.createTime',
        'chapter_check.updateTime',
        'user.id',
        'user.username',
        'chapter.id',
        'chapter.name',
        'chapter.status',
        'work.id',
        'work.title',
      ])
      .orderBy('chapter_check.id', 'DESC');

    if (status !== undefined) {
      qb.andWhere('chapter_check.status = :status', { status });
    }

    const [data, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  findOne() {
    throw new BadRequestException('不支持详情查询');
  }

  async update(id: number, updateChapterCheckDto: UpdateChapterCheckDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 1) 加锁读取待更新的审核记录（确保状态检查的一致性）
      const record = await queryRunner.manager.findOne(ChapterCheck, {
        where: { id },
        relations: ['chapter'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!record) {
        throw new BadRequestException('审核记录不存在');
      }
      if (record.status !== ChapterCheckStatus.Pending) {
        throw new BadRequestException('审核状态已变更，禁止再次修改');
      }

      // 2) 加锁读取当前章节所属作品（避免并发下章节数与作品状态不一致）
      const work = await queryRunner.manager.findOne(Work, {
        where: { chapters: { id: record.chapter?.id } },
        relations: ['chapters'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!work) {
        throw new BadRequestException('相关作品不存在');
      }

      // 3) 校验目标状态仅允许：通过或拒绝
      const nextStatus = updateChapterCheckDto.status as ChapterCheckStatus;
      if (
        nextStatus !== ChapterCheckStatus.Approved &&
        nextStatus !== ChapterCheckStatus.Rejected
      ) {
        throw new BadRequestException('仅支持状态变更为通过或拒绝');
      }

      record.status = nextStatus;

      if (record.chapter) {
        // 4) 加锁读取章节本体，避免 stale 数据写回
        const chapter = await queryRunner.manager.findOne(Chapter, {
          where: { id: record.chapter.id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!chapter) {
          throw new BadRequestException('章节不存在');
        }
        if (nextStatus === ChapterCheckStatus.Approved) {
          // 5) 审核通过：章节设为已上架、作品章节数+1、作品置为连载中（若非）
          const newCount = work.chapterCount + 1;
          const nextWorkStatus =
            work.status !== WorkStatus.SERIAL ? WorkStatus.SERIAL : work.status;

          const updChapterRes = await queryRunner.manager
            .createQueryBuilder()
            .update(Chapter)
            .set({ status: ChapterStatus.Approved })
            .where('id = :id', { id: chapter.id })
            .execute();
          if (!updChapterRes.affected) {
            throw new BadRequestException('章节状态更新失败');
          }

          const updWorkRes = await queryRunner.manager
            .createQueryBuilder()
            .update(Work)
            .set({ chapterCount: newCount, status: nextWorkStatus })
            .where('id = :id', { id: work.id })
            .execute();
          if (!updWorkRes.affected) {
            throw new BadRequestException('作品信息更新失败');
          }

          // 刷新内存态以保证响应数据准确
          chapter.status = ChapterStatus.Approved;
          work.chapterCount = newCount;
          work.status = nextWorkStatus;
        } else {
          // 6) 审核拒绝：仅更新章节状态为已下架
          const updChapterRes = await queryRunner.manager
            .createQueryBuilder()
            .update(Chapter)
            .set({ status: ChapterStatus.Rejected })
            .where('id = :id', { id: chapter.id })
            .execute();
          if (!updChapterRes.affected) {
            throw new BadRequestException('章节状态更新失败');
          }
          chapter.status = ChapterStatus.Rejected;
        }

        // 将最新章节对象挂回返回记录，保证响应数据一致
        record.chapter = chapter;
      }

      // 7) 持久化审核记录状态变更
      const saved = await queryRunner.manager.save(ChapterCheck, record);
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

  remove() {
    throw new BadRequestException('不支持删除操作');
  }
}
