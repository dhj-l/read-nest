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
  async findAll(@Body() findRecordDto: FindRecordDto) {
    return await this.recordService.findAll(findRecordDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recordService.findOne(+id);
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
