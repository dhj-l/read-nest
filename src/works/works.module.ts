import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksController } from './works.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Work } from './entities/work.entity';
import { Category } from 'src/category/entities/category.entity';
import { BookCheck } from 'src/book_check/entities/book_check.entity';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Work, Category, BookCheck])],
  controllers: [WorksController],
  providers: [WorksService],
  exports: [WorksService],
})
export class WorksModule {}
