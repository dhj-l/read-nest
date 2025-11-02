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
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { type FindAllRoleDto } from './type/type';
import { RoleItcInterceptor } from './itc/itc.interceptor';

@Controller('role')
@UseInterceptors(RoleItcInterceptor)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    try {
      return await this.roleService.create(createRoleDto);
    } catch (error) {
      throw new BadRequestException('角色值已存在');
    }
  }

  @Get()
  //获取所有角色
  //支持name模糊查询
  //支持分页查询
  async findAll(@Query() findAllRoleDto: FindAllRoleDto) {
    try {
      return await this.roleService.findAll(findAllRoleDto);
    } catch (error) {
      throw new BadRequestException('查询参数错误');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.roleService.findOne(id);
    } catch (error) {
      throw new BadRequestException('角色不存在');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    try {
      return await this.roleService.update(id, updateRoleDto);
    } catch (error) {
      throw new BadRequestException('更新参数错误');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.roleService.remove(id);
    } catch (error) {
      const { message } = error;

      throw new BadRequestException(message || '删除参数错误');
    }
  }
}
