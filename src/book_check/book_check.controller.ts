import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookCheckService } from './book_check.service';
import { CreateBookCheckDto } from './dto/create-book_check.dto';
import { UpdateBookCheckDto } from './dto/update-book_check.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import type { CreateBookCheckType } from './type/type';
import { UserService } from 'src/user/user.service';
import { WorksService } from 'src/works/works.service';

@Controller('book-check')
@UseGuards(AuthGuard)
export class BookCheckController {
  constructor(
    private readonly bookCheckService: BookCheckService,
    private readonly userService: UserService,
    private readonly workService: WorksService,
  ) {}

  @Post()
  async create(
    @Body() createBookCheckDto: CreateBookCheckDto,
    @Req() req: Request & { user: any },
  ) {}

  @Get()
  findAll() {
    return this.bookCheckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookCheckService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookCheckDto: UpdateBookCheckDto,
  ) {
    return this.bookCheckService.update(+id, updateBookCheckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookCheckService.remove(+id);
  }
}
