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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'read_nest',
      entities: [],
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
