import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { type FindAllRoleDto } from './type/type';
import { UserStatus } from 'src/user/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll(findAllRoleDto: FindAllRoleDto) {
    const { name = '', page = 1, pageSize = 10 } = findAllRoleDto;
    const [roles, total] = await this.roleRepository.findAndCount({
      where: {
        name: Like(`%${name}%`),
      },
      relations: ['permissions'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      roles,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    return await this.roleRepository.findOne({
      select: {
        id: true,
        name: true,
        value: true,
        users: {
          id: true,
          username: true,
          email: true,
          avatar_url: true,
        },
        createTime: true,
        updateTime: true,
      },
      where: {
        id,
        users: {
          status: UserStatus.ACTIVE,
        },
      },
      relations: ['users', 'permissions'],
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    return await this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: number) {
    const role = await this.roleRepository.findOne({
      where: {
        id,
      },
      relations: ['users'],
    });
    if (!role) {
      throw new BadRequestException('角色不存在');
    }
    if (role.users.length > 0) {
      throw new BadRequestException('该角色下有用户，不能删除');
    }
    return await this.roleRepository.delete(id);
  }

  async assignPermission(roleId: number, permissionIds: number[]) {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
      relations: ['permissions'],
    });
    if (!role) {
      throw new BadRequestException('角色不存在');
    }
    const permissions = await this.permissionRepository.find({
      where: {
        id: In(permissionIds),
      },
    });
    role.permissions = permissions;
    return await this.roleRepository.save(role);
  }
}
