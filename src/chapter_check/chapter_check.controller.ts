import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ChapterCheckService } from './chapter_check.service';
import { CreateChapterCheckDto } from './dto/create-chapter_check.dto';
import { UpdateChapterCheckDto } from './dto/update-chapter_check.dto';

@Controller('chapter-check')
export class ChapterCheckController {
  constructor(private readonly chapterCheckService: ChapterCheckService) {}

  @Post()
  create(@Body() createChapterCheckDto: CreateChapterCheckDto) {
    return this.chapterCheckService.create(createChapterCheckDto);
  }

  @Get()
  findAll() {
    return this.chapterCheckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chapterCheckService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChapterCheckDto: UpdateChapterCheckDto,
  ) {
    return this.chapterCheckService.update(+id, updateChapterCheckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chapterCheckService.remove(+id);
  }
}
