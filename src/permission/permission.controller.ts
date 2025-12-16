import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { type FindAllPermissionDto } from './type/type';
import { PermissionItcInterceptor } from './itc/permission-itc.interceptor';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('permission')
@UseInterceptors(PermissionItcInterceptor)
@UseGuards(AuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    try {
      return await this.permissionService.create(createPermissionDto);
    } catch (error) {
      throw new BadRequestException('权限值已存在');
    }
  }

  @Get()
  //获取所有权限
  //支持name模糊查询
  //支持分页查询
  async findAll(@Query() findAllPermissionDto: FindAllPermissionDto) {
    try {
      return await this.permissionService.findAll(findAllPermissionDto);
    } catch (error) {
      throw new BadRequestException('查询参数错误');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.permissionService.findOne(id);
    } catch (error) {
      throw new BadRequestException('权限不存在');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      return await this.permissionService.update(id, updatePermissionDto);
    } catch (error) {
      const { errno } = error;
      if (errno === 1062) {
        throw new BadRequestException('权限值已存在');
      } else throw new BadRequestException('更新参数错误');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.permissionService.remove(id);
    } catch (error) {
      const { message } = error;

      throw new BadRequestException(message || '删除参数错误');
    }
  }
}
