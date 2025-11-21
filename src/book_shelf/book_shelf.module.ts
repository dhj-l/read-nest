import { Module } from '@nestjs/common';
import { BookShelfService } from './book_shelf.service';
import { BookShelfController } from './book_shelf.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookShelf } from './entities/book_shelf.entity';
import { Work } from 'src/works/entities/work.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookShelf, Work, User]), UserModule],
  controllers: [BookShelfController],
  providers: [BookShelfService],
})
export class BookShelfModule {}
