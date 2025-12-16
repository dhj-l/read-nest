import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { type FindAllPermissionDto } from './type/type';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll(findAllPermissionDto: FindAllPermissionDto) {
    const { name = '', page = 1, pageSize = 10 } = findAllPermissionDto;
    const [permissions, total] = await this.permissionRepository.findAndCount({
      where: {
        name: Like(`%${name}%`),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      permissions,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    return await this.permissionRepository.findOne({
      select: {
        id: true,
        name: true,
        value: true,
        description: true,
        roles: {
          id: true,
          name: true,
          value: true,
        },
        createTime: true,
        updateTime: true,
      },
      where: {
        id,
      },
      relations: ['roles'],
    });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return await this.permissionRepository.update(id, updatePermissionDto);
  }

  async remove(id: number) {
    const permission = await this.permissionRepository.findOne({
      where: {
        id,
      },
      relations: ['roles'],
    });
    if (!permission) {
      throw new BadRequestException('权限不存在');
    }
    if (permission.roles.length > 0) {
      throw new BadRequestException('该权限下有角色，不能删除');
    }
    return await this.permissionRepository.delete(id);
  }
}
