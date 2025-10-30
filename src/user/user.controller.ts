import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserItcInterceptor } from './itc/user-itc.interceptor';

@Controller('user')
@UseInterceptors(UserItcInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}
  // 创建用户
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      // 对密码进行加密处理
      const hashedPassword = await argon2.hash(createUserDto.password);
      const userData = {
        ...createUserDto,
        password: hashedPassword,
      };
      return await this.userService.create(userData);
    } catch (error) {
      // 如果验证失败，错误会被 ValidationPipe 自动处理
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
