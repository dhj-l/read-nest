import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileTypes, type UploadResponse } from 'src/works/type/type';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { WorksInterceptor } from 'src/works/works.interceptor';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  /**
   * 上传作品封面
   */
  @Post()
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
  @UseInterceptors(WorksInterceptor)
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
