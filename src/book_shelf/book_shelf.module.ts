import { Module } from '@nestjs/common';
import { BookShelfService } from './book_shelf.service';
import { BookShelfController } from './book_shelf.controller';

@Module({
  controllers: [BookShelfController],
  providers: [BookShelfService],
})
export class BookShelfModule {}
