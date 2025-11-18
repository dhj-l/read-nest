import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Req,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { AddCategoryDto, UpdateWorkDto } from './dto/update-work.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { type FindAllWorkType } from './type/type';
import { WorksInterceptor } from './works.interceptor';
import { WorkStatus } from './entities/work.entity';

@Controller('works')
@UseGuards(AuthGuard)
@UseInterceptors(WorksInterceptor)
export class WorksController {
  constructor(
    private readonly worksService: WorksService,
    private readonly userService: UserService,
  ) {}
  //创建书籍
  @Post()
  async create(
    @Body() createWorkDto: CreateWorkDto,
    @Req() req: Request & { user: any },
  ) {
    try {
      const user = await this.userService.findOne(req.user.sub);
      createWorkDto.user = user;
      return await this.worksService.create(createWorkDto);
    } catch (error) {
      throw new BadRequestException(error.message || '创建失败');
    }
  }

  @Get()
  async findAll(@Query() query: FindAllWorkType) {
    try {
      // 确保status参数正确转换为数字类型
      if (query.status !== undefined) {
        query.status = Number(query.status) as WorkStatus;
      }
      console.log(query.status, '123');

      return await this.worksService.findAll(query);
    } catch (error) {
      throw new BadRequestException(error.message || '查询失败');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.worksService.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message || '查询失败');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    try {
      return await this.worksService.update(id, updateWorkDto);
    } catch (error) {
      throw new BadRequestException(error.message || '更新失败');
    }
  }
  /**
   * 给书籍添加分类
   */
  @Patch('/category/:id')
  async addCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() addCategoryDto: AddCategoryDto,
  ) {
    try {
      return await this.worksService.addCategory(id, addCategoryDto);
    } catch (error) {
      throw new BadRequestException(error.message || '添加分类失败');
    }
  }
}
