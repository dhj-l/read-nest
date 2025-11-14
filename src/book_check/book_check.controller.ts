import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { BookCheckService } from './book_check.service';
import { UpdateBookCheckDto } from './dto/update-book_check.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import { WorksService } from 'src/works/works.service';
import { QueryBookCheckDto } from './dto/query-book_check.dto';
import { BookCheckInterceptor } from './book_check.interceptor';
import { CreateBookCheckDto } from './dto/create-book_check.dto';

@Controller('book-check')
@UseGuards(AuthGuard)
@UseInterceptors(BookCheckInterceptor)
export class BookCheckController {
  constructor(
    private readonly bookCheckService: BookCheckService,
    private readonly userService: UserService,
    private readonly workService: WorksService,
  ) {}
  @Post()
  async create(@Req() req, @Body() createBookCheckDto: CreateBookCheckDto) {
    // 获取当前用户信息
    const user = await this.userService.findOne(req.user.sub);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 检查作品是否存在且属于当前用户
    const work = await this.workService.findOne(createBookCheckDto.workId);
    if (!work) {
      throw new BadRequestException('作品不存在');
    }

    if (work.user.id !== user.id) {
      throw new BadRequestException('只能提交自己作品的审核');
    }

    // 调用服务层创建审核记录
    return this.bookCheckService.create({
      work: work,
      user: user,
    });
  }

  @Get()
  findAll(@Query() query: QueryBookCheckDto) {
    return this.bookCheckService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookCheckService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookCheckDto: UpdateBookCheckDto,
  ) {
    return this.bookCheckService.update(id, updateBookCheckDto);
  }
}
