import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Like, Repository, In } from 'typeorm';
import { FindCategoryType } from './type/categoryType';
import { Work, WorkStatus } from 'src/works/entities/work.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new BadRequestException('分类名称已存在');
    }
  }

  async findAll({ name = '', page = 1, pageSize = 10 }: FindCategoryType) {
    const [categories, total] = await this.categoryRepository.findAndCount({
      where: {
        name: Like(`%${name}%`),
      },
      relations: ['works'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 将works数组转换为数量
    const categoriesWithCount = categories.map((category) => ({
      ...category,
      works: category.works.length,
    }));

    return {
      categories: categoriesWithCount,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
      relations: {
        works: true,
      },
    });
    if (!category) {
      throw new BadRequestException('分类不存在');
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      return await this.categoryRepository.update(id, updateCategoryDto);
    } catch (error) {
      throw new BadRequestException(error.message || '更新分类失败');
    }
  }

  async remove(id: number) {
    try {
      const category = await this.findOne(id);
      if (category.works.length > 0) {
        throw new BadRequestException('分类下存在作品，不能删除');
      }
      return await this.categoryRepository.delete(id);
    } catch (error) {
      throw new BadRequestException(error.message || '删除分类失败');
    }
  }

  /**
   * 获取不同分类下书籍的个数统计
   * 仅统计已上架、连载中、已完结的作品，排除未上架、已下架、审核失败的作品
   */
  async getWorkCountByCategory() {
    try {
      const categories = await this.categoryRepository.find({
        select: {
          id: true,
          name: true,
          description: true,
        },
        relations: {
          works: true,
        },
      });

      const result = categories.map((category) => {
        // 过滤掉未上架、已下架、审核失败的作品，只保留已上架、连载中、已完结的作品
        const validWorks = category.works.filter(
          (work) =>
            work.status === WorkStatus.PUBLISHED ||
            work.status === WorkStatus.SERIAL ||
            work.status === WorkStatus.ENDED,
        );

        return {
          categoryId: category.id,
          categoryName: category.name,
          description: category.description,
          workCount: validWorks.length,
        };
      });

      // 按书籍数量降序排序
      result.sort((a, b) => b.workCount - a.workCount);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message || '获取分类书籍数量失败');
    }
  }
}
