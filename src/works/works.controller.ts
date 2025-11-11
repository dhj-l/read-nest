import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';

@Controller('works')
@UseGuards(AuthGuard)
export class WorksController {
  constructor(
    private readonly worksService: WorksService,
    private readonly userService: UserService,
  ) {}
  //创建书籍
  @Post()
  async create(
    @Body() createWorkDto: CreateWorkDto,
    @Req() req: Request & { user: any },
  ) {
    // try {
    const user = await this.userService.findOne(req.user.sub);
    createWorkDto.user = user;
    return await this.worksService.create(createWorkDto);
    // } catch (error) {
    //   throw new BadRequestException(error.message || '创建失败');
    // }
  }

  @Get()
  findAll() {
    return this.worksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.worksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkDto: UpdateWorkDto) {
    return this.worksService.update(+id, updateWorkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.worksService.remove(+id);
  }
}
