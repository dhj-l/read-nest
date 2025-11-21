import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { Work } from 'src/works/entities/work.entity';
import { Record } from 'src/record/entities/record.entity';
import { User } from 'src/user/entities/user.entity';

import { WorksModule } from 'src/works/works.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chapter, Work, Record, User]),
    WorksModule,
    UserModule,
  ],
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
