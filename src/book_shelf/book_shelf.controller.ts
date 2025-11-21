import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  BadRequestException,
  UseGuards,
  Query,
  Req,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { BookShelfService } from './book_shelf.service';
import { CreateBookShelfDto } from './dto/create-book_shelf.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import type { Request } from 'express';
import { QueryShelfDto } from './dto/query-shelf.dto';
import { ChapterInterceptor } from 'src/chapter/chapter.interceptor';

@Controller('book-shelf')
@UseGuards(AuthGuard)
@UseInterceptors(ChapterInterceptor)
export class BookShelfController {
  constructor(private readonly bookShelfService: BookShelfService) {}

  @Post()
  async create(
    @Body() createBookShelfDto: CreateBookShelfDto,
    @Req() req: Request & { user: { sub: number } },
  ) {
    try {
      return await this.bookShelfService.ensureShelf(req.user.sub);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '创建书架失败',
      );
    }
  }

  @Get('works')
  async listWorks(
    @Query() query: QueryShelfDto,
    @Req() req: Request & { user: { sub: number } },
  ) {
    try {
      return await this.bookShelfService.listWorks(req.user.sub, query);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '查询书架失败',
      );
    }
  }

  @Post('works/:workId')
  async addWork(
    @Param('workId', ParseIntPipe) workId: number,
    @Req() req: Request & { user: { sub: number } },
  ) {
    try {
      return await this.bookShelfService.addWork(req.user.sub, workId);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '添加书籍到书架失败',
      );
    }
  }

  @Delete('works/:workId')
  async removeWork(
    @Param('workId', ParseIntPipe) workId: number,
    @Req() req: Request & { user: { sub: number } },
  ) {
    try {
      return await this.bookShelfService.removeWork(req.user.sub, workId);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '从书架移除书籍失败',
      );
    }
  }

  @Get()
  async getShelf(@Req() req: Request & { user: { sub: number } }) {
    try {
      return await this.bookShelfService.getShelf(req.user.sub);
    } catch (error: unknown) {
      throw new BadRequestException(
        error instanceof Error ? error.message : '查询书架失败',
      );
    }
  }
}
