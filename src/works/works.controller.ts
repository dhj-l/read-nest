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
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { WorksService } from './works.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto, UpdateWorkStatusDto } from './dto/update-work.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from 'src/user/user.service';
import {
  FileTypes,
  type FindAllWorkType,
  type UploadResponse,
} from './type/type';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { WorksInterceptor } from './works.interceptor';

@Controller('works')
@UseGuards(AuthGuard)
@UseInterceptors(WorksInterceptor)
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
    try {
      const user = await this.userService.findOne(req.user.sub);
      createWorkDto.user = user;
      return await this.worksService.create(createWorkDto);
    } catch (error) {
      throw new BadRequestException(error.message || '创建失败');
    }
  }

  @Get()
  async findAll(@Query() query: FindAllWorkType) {
    try {
      return await this.worksService.findAll(query);
    } catch (error) {
      throw new BadRequestException(error.message || '查询失败');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.worksService.findOne(id);
    } catch (error) {
      throw new BadRequestException(error.message || '查询失败');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkDto: UpdateWorkDto,
  ) {
    try {
      return await this.worksService.update(id, updateWorkDto);
    } catch (error) {
      throw new BadRequestException(error.message || '更新失败');
    }
  }
  //修改书籍状态
  @Patch('/status/:id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkStatusDto: UpdateWorkStatusDto,
  ) {
    try {
      return this.worksService.updateStatus(id, updateWorkStatusDto);
    } catch (error) {
      throw new BadRequestException(error.message || '更新作品状态失败');
    }
  }
  //TODO: 将来移出去作为一个单独的模块
  /**
   * 上传作品封面
   */
  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/works',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          callback(null, uniqueSuffix);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File): UploadResponse {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }
    if (!FileTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        '文件类型错误，只允许上传 PNG、JPEG、JPG 格式',
      );
    }

    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/works/${file.filename}`,
    };
  }
}
