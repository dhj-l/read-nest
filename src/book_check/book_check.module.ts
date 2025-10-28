import { Module } from '@nestjs/common';
import { BookCheckService } from './book_check.service';
import { BookCheckController } from './book_check.controller';

@Module({
  controllers: [BookCheckController],
  providers: [BookCheckService],
})
export class BookCheckModule {}
