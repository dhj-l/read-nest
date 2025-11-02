import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ConflictException,
  Query,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserItcInterceptor } from './itc/user-itc.interceptor';
import { type FindUser } from './type/type';
import { EmailService } from 'src/email/email.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
@UseInterceptors(UserItcInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}
  // 注册用户
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      // 验证验证码
      const isCodeValid = await this.emailService.verifyCode(
        createUserDto.email,
        createUserDto.code,
      );
      if (!isCodeValid) {
        throw new BadRequestException('验证码错误');
      }
      //对密码进行加密处理
      createUserDto.password = await argon2.hash(createUserDto.password);
      return await this.userService.create(createUserDto);
    } catch (error) {
      const { message } = error;
      throw new ConflictException(message || '用户名或邮箱已存在');
    }
  }
  //查询所有用户
  //支持分页传参，默认每页10条
  //支持用户名模糊查询
  @Get('/all')
  @UseGuards(AuthGuard)
  findAll(@Query() query: FindUser) {
    try {
      return this.userService.findAll(query);
    } catch (error) {
      throw new ConflictException('查询用户失败');
    }
  }
  //根据id查询用户
  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.userService.findOne(id);
    } catch (error) {
      const { response } = error;
      throw new ConflictException(response?.message || '查询用户失败');
    }
  }
  //更新用户
  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.userService.update(id, updateUserDto);
    } catch (error) {
      const { response } = error;
      throw new ConflictException(response?.message || '更新用户失败');
    }
  }
  //封禁用户
  @Patch('/disabled/:id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.userService.remove(id);
    } catch (error) {
      const { response } = error;
      throw new ConflictException(response?.message || '封禁用户失败');
    }
  }
  //给用户添加角色
  @Post('/role/:id')
  @UseGuards(AuthGuard)
  async addRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() roleids: string[],
  ) {
    try {
      return await this.userService.addRole(id, roleids);
    } catch (error) {
      const { response } = error;
      throw new ConflictException(response?.message || '分配角色失败');
    }
  }
  //用户登录
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.userService.login(loginDto);
    } catch (error) {
      const { message } = error;
      throw new ConflictException(message || '登录失败');
    }
  }
}
