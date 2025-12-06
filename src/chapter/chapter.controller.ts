import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
  Query,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ChapterService } from './chapter.service';
import { CreateChapterDto, FindChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { WorksService } from 'src/works/works.service';
import { Work } from 'src/works/entities/work.entity';
import { ChapterInterceptor } from './chapter.interceptor';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('chapter')
@UseGuards(AuthGuard)
@UseInterceptors(ChapterInterceptor)
export class ChapterController {
  constructor(
    private readonly chapterService: ChapterService,
    private readonly workService: WorksService,
  ) {}

  @Post('/:workId')
  async create(
    @Body() createChapterDto: CreateChapterDto,
    @Param('workId', ParseIntPipe) workId: number,
  ) {
    try {
      return await this.chapterService.create(workId, createChapterDto);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '创建失败',
      );
    }
  }

  @Get()
  async findAll(@Query() query: FindChapterDto) {
    try {
      let work: Work | undefined;
      if (query.workId !== undefined) {
        work = await this.workService.findOne(Number(query.workId));
      }
      return await this.chapterService.findAll(work, query);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '查询失败',
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { sub: number } },
  ) {
    try {
      return await this.chapterService.findOne(id, req.user.sub);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '查询失败',
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    try {
      return await this.chapterService.update(id, updateChapterDto);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '更新失败',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.chapterService.remove(id);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '删除失败',
      );
    }
  }

  @Patch(':id/pending')
  async toPending(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { sub: number } },
  ) {
    try {
      return await this.chapterService.toPending(id, req.user.sub);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '提交失败',
      );
    }
  }
}
