import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import {
  AddCategoryDto,
  UpdateWorkDto,
  UpdateWorkStatusDto,
} from './dto/update-work.dto';
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
      console.log(error);

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
        category_ids = -1,
        sort = 'DESC',
      } = query;

      // 构建查询条件
      const whereConditions: any = {
        title: Like(`%${title}%`),
        status: status === WorkStatus.ALL ? undefined : status,
        user: {
          username: Like(`%${username}%`),
        },
        categorys: {
          id: category_ids === -1 ? undefined : In(category_ids),
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

      const [works, total] = await this.workRepository.findAndCount({
        where: whereConditions,
        order: {
          id: sort,
        },
        relations: ['categorys'],
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
        relations: ['categorys', 'user', 'bookChecks', 'chapters'],
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
      await this.workRepository.update(id, updateWorkDto);
      return await this.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message || '更新作品失败');
    }
  }
  /**
   * 修改作品状态
   */
  async updateStatus(id: number, updateWorkStatusDto: UpdateWorkStatusDto) {
    try {
      const work = await this.findOne(id);
      work.status = WorkStatus[updateWorkStatusDto.status];
      return await this.workRepository.save(work);
    } catch (error) {
      throw new BadRequestException(error.message || '更新作品状态失败');
    }
  }
  /**
   * 给书籍添加分类
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
