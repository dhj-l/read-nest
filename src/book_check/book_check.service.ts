import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateBookCheckDto } from './dto/update-book_check.dto';
import type { CreateBookCheckType } from './type/type';
import { InjectRepository } from '@nestjs/typeorm';
import { BookCheck } from './entities/book_check.entity';
import { Repository, Like, DataSource } from 'typeorm';
import { QueryBookCheckDto } from './dto/query-book_check.dto';
import { Work } from 'src/works/entities/work.entity';

@Injectable()
export class BookCheckService {
  constructor(
    @InjectRepository(BookCheck)
    private bookCheckRepository: Repository<BookCheck>,
    private dataSource: DataSource,
  ) {}
  async create(createBookCheckDto: CreateBookCheckType) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查书籍状态是否为审核失败（5）
      const work = createBookCheckDto.work;

      // 只有状态为审核失败（5）的书籍才能添加审核记录
      if (work.status !== 5) {
        throw new BadRequestException('只有审核失败的书籍才能重新提交审核');
      }

      // 检查是否已存在状态为0（待审核）的审核记录
      const existingPendingCheck = await queryRunner.manager.findOne(
        BookCheck,
        {
          where: {
            work: { id: work.id },
            status: 0, // 待审核状态
          },
        },
      );

      if (existingPendingCheck) {
        throw new BadRequestException(
          '该作品已经存在待审核的记录，请勿重复提交',
        );
      }

      // 1. 更新书籍状态为未上架（0）
      await queryRunner.manager.update(Work, work.id, {
        status: 0,
      });

      // 2. 创建新的审核记录，状态默认为待审核（0）
      const bookCheck = queryRunner.manager.create(BookCheck, {
        work: work,
        user: createBookCheckDto.user,
        status: 0, // 待审核状态
      });

      const result = await queryRunner.manager.save(bookCheck);

      // 提交事务
      await queryRunner.commitTransaction();

      return result;
    } catch (error) {
      // 回滚事务
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || '创建审核记录失败');
    } finally {
      // 释放连接
      await queryRunner.release();
    }
  }

  async findAll(query: QueryBookCheckDto) {
    const { page = 1, pageSize = 10, status, userId, workId } = query;

    const queryBuilder = this.bookCheckRepository
      .createQueryBuilder('book_check')
      .leftJoinAndSelect('book_check.user', 'user')
      .leftJoinAndSelect('book_check.work', 'work')
      .select([
        'book_check.id',
        'book_check.status',
        'book_check.createTime',
        'book_check.updateTime',
        'user.id',
        'user.username',
        'user.email',
        'work.id',
        'work.title',
        'work.status',
        'work.cover_url',
      ])
      .orderBy('book_check.id', 'DESC');

    // 状态筛选
    if (status !== undefined) {
      queryBuilder.andWhere('book_check.status = :status', { status });
    }

    // 用户筛选
    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }

    // 作品筛选
    if (workId) {
      queryBuilder.andWhere('work.id = :workId', { workId });
    }

    const [data, total] = await queryBuilder
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

  async findOne(id: number) {
    const bookCheck = await this.bookCheckRepository
      .createQueryBuilder('book_check')
      .leftJoinAndSelect('book_check.user', 'user')
      .leftJoinAndSelect('book_check.work', 'work')
      .select([
        'book_check.id',
        'book_check.status',
        'book_check.createTime',
        'book_check.updateTime',
        'user.id',
        'user.username',
        'user.email',
        'work.id',
        'work.title',
        'work.status',
        'work.cover_url',
        'work.description',
        'work.count',
      ])
      .where('book_check.id = :id', { id })
      .getOne();

    if (!bookCheck) {
      throw new BadRequestException('审核记录不存在');
    }

    return bookCheck;
  }

  async update(id: number, updateBookCheckDto: UpdateBookCheckDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { status } = updateBookCheckDto;
      const book_check = await queryRunner.manager.findOne(BookCheck, {
        where: {
          id,
        },
        relations: ['work'],
      });
      if (status === 1) {
        //审核通过的逻辑
        //1.修改审核状态
        await queryRunner.manager.update(BookCheck, id, { status });
        //2.修改对应书籍的状态
        //将书籍状态修改为已发布
        await queryRunner.manager.update(Work, book_check?.work.id, {
          status: 1,
        });
        //提交事务
        await queryRunner.commitTransaction();
        return '审核通过';
      } else if (status === 2) {
        //审核失败的逻辑
        await queryRunner.manager.update(BookCheck, id, { status });
        //将书籍状态修改为审核失败
        await queryRunner.manager.update(Work, book_check?.work.id, {
          status: 5,
        });
        //提交事务
        await queryRunner.commitTransaction();
        return '审核失败';
      } else {
        throw new BadRequestException('状态值不正确');
      }
    } catch (error) {
      //回滚事务
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message || '更新审核记录失败');
    } finally {
      //释放连接
      await queryRunner.release();
    }
  }
}
