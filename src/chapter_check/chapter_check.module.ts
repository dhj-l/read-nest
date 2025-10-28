import { Module } from '@nestjs/common';
import { ChapterCheckService } from './chapter_check.service';
import { ChapterCheckController } from './chapter_check.controller';

@Module({
  controllers: [ChapterCheckController],
  providers: [ChapterCheckService],
})
export class ChapterCheckModule {}
