import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { WorksModule } from './works/works.module';
import { CategoryModule } from './category/category.module';
import { ChapterModule } from './chapter/chapter.module';
import { RecordModule } from './record/record.module';
import { BookShelfModule } from './book_shelf/book_shelf.module';
import { BookCheckModule } from './book_check/book_check.module';
import { ChapterCheckModule } from './chapter_check/chapter_check.module';
import { User } from './user/entities/user.entity';
import { Role } from './role/entities/role.entity';
import { Work } from './works/entities/work.entity';
import { Category } from './category/entities/category.entity';
import { Chapter } from './chapter/entities/chapter.entity';
import { Record } from './record/entities/record.entity';
import { BookShelf } from './book_shelf/entities/book_shelf.entity';
import { BookCheck } from './book_check/entities/book_check.entity';
import { ChapterCheck } from './chapter_check/entities/chapter_check.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'read_nest',
      entities: [
        User,
        Role,
        Work,
        Category,
        Chapter,
        Record,
        BookShelf,
        BookCheck,
        ChapterCheck,
      ],
      synchronize: true,
      logging: ['error'],
    }),
    UserModule,
    RoleModule,
    WorksModule,
    CategoryModule,
    ChapterModule,
    RecordModule,
    BookShelfModule,
    BookCheckModule,
    ChapterCheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
