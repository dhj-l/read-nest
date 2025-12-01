import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { AddCategoryDto, UpdateWorkDto } from './dto/update-work.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Work, WorkStatus } from './entities/work.entity';
import {
  DataSource,
  In,
  Like,
  MoreThanOrEqual,
  Repository,
  Between,
} from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { BookCheck } from 'src/book_check/entities/book_check.entity';
import {
  CountLevel,
  CountLevelRanges,
  type FindAllWorkType,
} from './type/type';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work) private workRepository: Repository<Work>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(BookCheck)
    private bookCheckRepository: Repository<BookCheck>,
    private dataSource: DataSource,
  ) {}
  async create(createWorkDto: CreateWorkDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //1.验证分类是否存在
      const categorys = await queryRunner.manager.find(Category, {
        where: {
          id: In(createWorkDto.category_ids),
        },
      });

      if (categorys.length !== createWorkDto.category_ids.length) {
        throw new BadRequestException('部分分类不存在');
      }

      //2.创建作品
      const work = queryRunner.manager.create(Work, {
        ...createWorkDto,
        categorys,
      });

      const savedWork = await queryRunner.manager.save(Work, work);

      //3.创建审核记录
      const bookCheck = queryRunner.manager.create(BookCheck, {
        work: savedWork,
        user: createWorkDto.user,
        status: 0, // 待审核状态
      });

      await queryRunner.manager.save(BookCheck, bookCheck);

      //4.提交事务
      await queryRunner.commitTransaction();

      return savedWork;
    } catch (error) {
      //5.回滚事务
      await queryRunner.rollbackTransaction();

      if (error.errno === 1062) {
        // PostgreSQL 唯一约束违反
        throw new BadRequestException('作品标题已存在');
      }

      throw new BadRequestException(error.message || '创建作品失败');
    } finally {
      //6.释放查询运行器
      await queryRunner.release();
    }
  }

  async findAll(query: FindAllWorkType) {
    try {
      const {
        page = 1,
        pageSize = 10,
        title = '',
        username = '',
        status = WorkStatus.ALL,
        count = CountLevel.ALL,
        category_ids = '-1',
        sort = 'hot',
      } = query;

      // 构建查询条件
      const whereConditions: any = {
        title: Like(`%${title}%`),

        user: {
          username: Like(`%${username}%`),
        },
        categorys: {
          id: category_ids == '-1' ? undefined : In(category_ids.split(',')),
        },
      };

      // 处理字数等级查询
      if (count !== CountLevel.ALL) {
        const range = CountLevelRanges[count];
        if (range.max === Infinity) {
          // 120万字以上
          whereConditions.count = MoreThanOrEqual(range.min);
        } else {
          // 其他区间
          whereConditions.count = Between(range.min, range.max);
        }
      }
      // 处理状态查询
      if (status !== WorkStatus.ALL) {
        whereConditions.status =
          status === WorkStatus.PUBLISHED_SERIAL_ENDED
            ? In([WorkStatus.PUBLISHED, WorkStatus.SERIAL, WorkStatus.ENDED])
            : status;
      }
      const order = {};
      console.log(sort);
      //处理sort
      if (sort === 'hot') {
        order['readCount'] = 'DESC';
      } else if (sort === 'new') {
        order['updateTime'] = 'DESC';
      } else if (sort === 'count') {
        order['count'] = 'DESC';
      }
      console.log(order);

      const [works, total] = await this.workRepository.findAndCount({
        select: {
          id: true,
          title: true,
          count: true,
          status: true,
          description: true,
          cover_url: true,
          readCount: true,
          chapterCount: true,
          user: {
            id: true,
            username: true,
          },
          categorys: {
            id: true,
            name: true,
          },
          createTime: true,
          updateTime: true,
        },
        where: whereConditions,
        order,
        relations: ['categorys', 'user'],
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return {
        works,
        total,
      };
    } catch (error) {
      throw new BadRequestException(error.message || '查询作品失败');
    }
  }

  async findOne(id: number) {
    try {
      const selectOptions = {
        id: true,
        title: true,
        count: true,
        status: true,
        description: true,
        cover_url: true,
        readCount: true,
        chapterCount: true,
        categorys: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          username: true,
        },
      };
      const work = await this.workRepository.findOne({
        select: selectOptions,
        where: {
          id,
        },
        relations: ['categorys', 'user', 'bookChecks'],
      });
      if (!work) {
        throw new BadRequestException('作品不存在');
      }
      return work;
    } catch (error) {
      throw new BadRequestException(error.message || '查询作品失败');
    }
  }

  async update(id: number, updateWorkDto: UpdateWorkDto) {
    try {
      const work = await this.findOne(id);

      // 如果有status字段，直接赋值（前端传入的是数字，但需排除查询用的WorkStatus.ALL）
      if (
        updateWorkDto.status !== undefined &&
        updateWorkDto.status !== WorkStatus.ALL
      ) {
        work.status = updateWorkDto.status;
        delete updateWorkDto.status; // 从DTO中移除，避免冲突
      }

      // 合并其他更新字段
      Object.assign(work, updateWorkDto);

      return await this.workRepository.save(work);
    } catch (error) {
      throw new BadRequestException(error.message || '更新作品失败');
    }
  }
  /**
   * 给书籍设置分类
   */
  async addCategory(id: number, addCategoryDto: AddCategoryDto) {
    try {
      const work = await this.findOne(id);
      const categorys = await this.categoryRepository.find({
        where: {
          id: In(addCategoryDto.categoryIds),
        },
      });
      if (categorys.length !== addCategoryDto.categoryIds.length) {
        throw new BadRequestException('部分分类不存在');
      }
      work.categorys = categorys;
      return await this.workRepository.save(work);
    } catch (error) {
      throw new BadRequestException(error.message || '添加分类失败');
    }
  }
}
