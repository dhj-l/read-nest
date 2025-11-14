import { Module } from '@nestjs/common';
import { BookCheckService } from './book_check.service';
import { BookCheckController } from './book_check.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookCheck } from './entities/book_check.entity';
import { WorksModule } from 'src/works/works.module';
import { Work } from 'src/works/entities/work.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([BookCheck, Work]),
    WorksModule,
  ],
  controllers: [BookCheckController],
  providers: [BookCheckService],
})
export class BookCheckModule {}
