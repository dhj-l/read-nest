import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  //发送验证码
  @Post('send-code')
  async sendCode(@Body() createEmailDto: CreateEmailDto) {
    try {
      const isSent = await this.emailService.sendVerificationCode(
        createEmailDto.email,
      );
      if (!isSent) {
        throw new BadRequestException('验证码发送失败');
      }
      return {
        code: 200,
        message: '验证码发送成功',
        data: null,
      };
    } catch (error) {
      const { message } = error;
      throw new BadRequestException(message || '验证码发送失败');
    }
  }
}
