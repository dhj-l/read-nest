import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChapterCheckDto } from './dto/create-chapter_check.dto';
import { UpdateChapterCheckDto } from './dto/update-chapter_check.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter, ChapterStatus } from 'src/chapter/entities/chapter.entity';
import { And, In, Repository } from 'typeorm';
import {
  ChapterCheck,
  ChapterCheckStatus,
} from './entities/chapter_check.entity';
import { Work } from 'src/works/entities/work.entity';

@Injectable()
export class ChapterCheckService {
  constructor(
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
    const record = await this.chapterCheckRepository.findOne({
      where: { id },
      relations: ['chapter'],
    });
    const work = await this.workRepository.findOne({
      where: {
        chapters: {
          id: record?.chapter.id,
        },
      },
      relations: ['chapters'],
    });
    console.log(work);
    if (!work) {
      throw new BadRequestException('相关作品不存在');
    }
    if (!record) {
      throw new BadRequestException('审核记录不存在');
    }
    if (record.status !== 0) {
      throw new BadRequestException('审核状态已变更，禁止再次修改');
    }
    const nextStatus = updateChapterCheckDto.status as ChapterCheckStatus;
    if (
      nextStatus !== ChapterCheckStatus.Approved &&
      nextStatus !== ChapterCheckStatus.Rejected
    ) {
      throw new BadRequestException('仅支持状态变更为通过或拒绝');
    }
    record.status = nextStatus;
    if (record.chapter) {
      if (nextStatus === ChapterCheckStatus.Approved) {
        record.chapter.status = ChapterStatus.Approved;
      } else if (nextStatus === ChapterCheckStatus.Rejected) {
        record.chapter.status = ChapterStatus.Rejected;
      }
      await this.chapterRepository.save(record.chapter);
      work.chapterCount += 1;
      await this.workRepository.save(work);
    }
    return await this.chapterCheckRepository.save(record);
  }

  remove() {
    throw new BadRequestException('不支持删除操作');
  }
}
