import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BookShelf } from './entities/book_shelf.entity';
import { User } from 'src/user/entities/user.entity';
import { Work } from 'src/works/entities/work.entity';
import { QueryShelfDto } from './dto/query-shelf.dto';

@Injectable()
export class BookShelfService {
  constructor(
    @InjectRepository(BookShelf)
    private readonly bookShelfRepository: Repository<BookShelf>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 确保用户书架存在，如果不存在则创建
   */
  async ensureShelf(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      let shelf = await this.bookShelfRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (shelf) return shelf;

      shelf = this.bookShelfRepository.create({ user });
      return await this.bookShelfRepository.save(shelf);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '确保书架存在失败',
      );
    }
  }

  /**
   * 添加作品到用户书架
   */
  async addWork(userId: number, workId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 验证用户是否存在
      const user = await queryRunner.manager.findOne(User, {
        select: ['id', 'username'],
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      // 验证作品是否存在
      const work = await queryRunner.manager.findOne(Work, {
        where: { id: workId },
      });
      if (!work) {
        throw new BadRequestException('作品不存在');
      }

      // 获取或创建书架
      let shelf = await queryRunner.manager.findOne(BookShelf, {
        where: { user: { id: userId } },
        relations: ['user', 'works'],
      });

      if (!shelf) {
        shelf = queryRunner.manager.create(BookShelf, { user });
        shelf = await queryRunner.manager.save(BookShelf, shelf);
      }

      // 检查作品是否已在书架中
      const hasWork = shelf.works?.some((w) => w.id === workId) ?? false;
      if (hasWork) {
        await queryRunner.commitTransaction();
        Reflect.deleteProperty(shelf, 'user');
        return shelf;
      }

      // 添加作品到书架
      shelf.works = [...(shelf.works ?? []), work];
      const savedShelf = await queryRunner.manager.save(BookShelf, shelf);
      await queryRunner.commitTransaction();
      Reflect.deleteProperty(savedShelf, 'user');
      return savedShelf;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error instanceof Error ? error.message : '添加作品到书架失败',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 从用户书架移除作品
   */
  async removeWork(userId: number, workId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取书架
      const shelf = await queryRunner.manager.findOne(BookShelf, {
        where: { user: { id: userId } },
        relations: ['works'],
      });

      if (!shelf) {
        throw new BadRequestException('书架不存在');
      }

      // 移除作品
      shelf.works = (shelf.works ?? []).filter((w) => w.id !== workId);
      await queryRunner.manager.save(BookShelf, shelf);
      await queryRunner.commitTransaction();

      return { id: workId };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        error instanceof Error ? error.message : '从书架移除作品失败',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 获取用户书架中的作品列表
   */
  async listWorks(userId: number, query: QueryShelfDto) {
    try {
      const { page = 1, pageSize = 10 } = query;
      const shelf = await this.ensureShelf(userId);
      console.log(shelf);

      const qb = this.workRepository
        .createQueryBuilder('work')
        .innerJoin('work.bookShelves', 'shelf', 'shelf.id = :sid', {
          sid: shelf.id,
        })
        .leftJoin('work.user', 'user')
        .leftJoin('work.categorys', 'category')
        .select([
          'work.id',
          'work.title',
          'work.cover_url',
          'work.readCount',
          'work.status',
          'work.count',
          'work.chapterCount',
          'work.description',
          'work.createTime',
          'work.updateTime',
          'user.id',
          'user.username',
          'category.id',
          'category.name',
        ])
        .orderBy('work.id', 'DESC');

      const [works, total] = await qb
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

      return { works, total, page, pageSize };
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '获取书架作品列表失败',
      );
    }
  }

  /**
   * 获取用户书架信息
   */
  async getShelf(userId: number) {
    try {
      const shelf = await this.bookShelfRepository.findOne({
        where: { user: { id: userId } },
        relations: ['works'],
      });

      if (!shelf) {
        return await this.ensureShelf(userId);
      }

      return shelf;
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '获取书架信息失败',
      );
    }
  }
}
