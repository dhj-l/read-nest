import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Work } from './entities/work.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { BookCheck } from 'src/book_check/entities/book_check.entity';

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

  findAll() {
    return `This action returns all works`;
  }

  findOne(id: number) {
    return `This action returns a #${id} work`;
  }

  update(id: number, updateWorkDto: UpdateWorkDto) {
    return `This action updates a #${id} work`;
  }

  remove(id: number) {
    return `This action removes a #${id} work`;
  }
}
