import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Req,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { CreateRecordDto, FindRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChapterInterceptor } from 'src/chapter/chapter.interceptor';

@Controller('record')
@UseGuards(AuthGuard)
@UseInterceptors(ChapterInterceptor)
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get()
  async findAll(
    @Body() findRecordDto: FindRecordDto,
    @Req() req: Request & { user: { sub: number } },
  ) {
    return await this.recordService.findAll(findRecordDto, req.user.sub);
  }

  @Get(':workId')
  findOne(
    @Param('workId', ParseIntPipe) workId: number,
    @Req() req: Request & { user: { sub: number } },
  ) {
    return this.recordService.findOne(workId, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecordDto: UpdateRecordDto) {
    return this.recordService.update(+id, updateRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recordService.remove(+id);
  }
}
