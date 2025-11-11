import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseInterceptors,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryItcInterceptor } from './itc/category-itc.interceptor';
import { AuthGuard } from 'src/auth/auth.guard';
import type { FindCategoryType } from './type/categoryType';

@Controller('category')
@UseInterceptors(CategoryItcInterceptor)
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  /**
   * 创建分类
   * @param createCategoryDto
   * @returns
   */
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categoryService.create(createCategoryDto);
    } catch (error) {
      throw new BadRequestException(error.message || '创建分类失败');
    }
  }

  @Get()
  async findAll(@Query() query: FindCategoryType) {
    const { name = '', page = 1, pageSize = 10 } = query;
    try {
      return await this.categoryService.findAll({
        name,
        page,
        pageSize,
      });
    } catch (error) {
      throw new BadRequestException(error.message || '查询分类失败');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.categoryService.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message || '查询分类失败');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      return await this.categoryService.update(id, updateCategoryDto);
    } catch (error) {
      throw new BadRequestException(error.message || '更新分类失败');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.categoryService.remove(id);
    } catch (error) {
      throw new BadRequestException(error.message || '删除分类失败');
    }
  }
}
