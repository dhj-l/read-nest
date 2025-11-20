import { Module } from '@nestjs/common';
import { ChapterCheckService } from './chapter_check.service';
import { ChapterCheckController } from './chapter_check.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from 'src/chapter/entities/chapter.entity';
import { ChapterCheck } from './entities/chapter_check.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Chapter, ChapterCheck])],
  controllers: [ChapterCheckController],
  providers: [ChapterCheckService],
})
export class ChapterCheckModule {}
