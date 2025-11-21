import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ChapterCheckService } from './chapter_check.service';
import type { Request } from 'express';
import { QueryChapterCheckDto } from './dto/query-chapter_check.dto';
import { CreateChapterCheckDto } from './dto/create-chapter_check.dto';
import { UpdateChapterCheckDto } from './dto/update-chapter_check.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChapterInterceptor } from 'src/chapter/chapter.interceptor';

@Controller('chapter-check')
@UseGuards(AuthGuard)
@UseInterceptors(ChapterInterceptor)
export class ChapterCheckController {
  constructor(private readonly chapterCheckService: ChapterCheckService) {}

  @Post()
  async create(
    @Body() createChapterCheckDto: CreateChapterCheckDto,
    @Req() req: Request & { user: { username: string; sub: number } },
  ) {
    try {
      return await this.chapterCheckService.create(
        createChapterCheckDto,
        req.user,
      );
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '创建失败',
      );
    }
  }

  @Get()
  findAll(@Query() query: QueryChapterCheckDto) {
    return this.chapterCheckService.findAll(query);
  }

  @Get(':id')
  findOne() {
    throw new BadRequestException('不支持详情查询');
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChapterCheckDto: UpdateChapterCheckDto,
  ) {
    return this.chapterCheckService.update(id, updateChapterCheckDto);
  }

  @Delete(':id')
  remove() {
    throw new BadRequestException('不支持删除操作');
  }
}
