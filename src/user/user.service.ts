import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/user.entity';
import { In, Like, Repository } from 'typeorm';
import { type FindUser } from './type/type';
import { v4 as uuidv4 } from 'uuid';
import { Role } from 'src/role/entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(query: FindUser) {
    const {
      username = '',
      page = 1,
      pageSize = 10,
      status = UserStatus.ACTIVE,
    } = query;
    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'email',
        'avatar_url',
        'status',
        'roles',
        'createTime',
        'updateTime',
      ],
      where: {
        username: Like(`%${username}%`),
        status,
      },
      relations: ['roles'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      users,
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      select: ['id', 'username', 'email', 'avatar_url', 'status', 'roles'],
      where: {
        id,
      },
      relations: ['roles'],
    });

    if (!user) {
      throw new ConflictException('用户不存在');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new ConflictException('用户不存在');
    }
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw new ConflictException('用户不存在');
    }
    user.status = UserStatus.DISABLED;
    user.disabled_time = new Date().toISOString();
    user.disabled_name = uuidv4();
    return await this.userRepository.save(user);
  }
  /**
   * 解封用户
   */
  async unblock(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        status: UserStatus.DISABLED,
      },
    });
    if (!user) {
      throw new ConflictException('用户不存在或未被禁用');
    }
    user.status = UserStatus.ACTIVE;
    user.disabled_time = '';
    user.disabled_name = '';
    return await this.userRepository.save(user);
  }
  async addRole(id: number, roleids: string[]) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        status: UserStatus.ACTIVE,
      },
    });
    if (!user) {
      throw new ConflictException('用户不存在或已被禁用');
    }
    const roles = await this.roleRepository.find({
      where: {
        id: In(roleids),
      },
    });
    //如果说查询出来的角色数量和传入的角色数量不一致，说明有角色不存在
    if (roles.length !== roleids.length) {
      throw new ConflictException('角色不存在');
    }
    user.roles = roles;
    user.updateTime = new Date(); // 手动更新时间戳
    return await this.userRepository.save(user);
  }
  async findByName(username: string, status: UserStatus) {
    return await this.userRepository.findOne({
      where: {
        username,
        status,
      },
    });
  }
  async login(loginDto: LoginDto) {
    const user = await this.findByName(loginDto.username, UserStatus.ACTIVE);
    if (!user) {
      throw new BadRequestException('用户被封禁或者不存在');
    }
    // 验证密码
    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('密码错误');
    }
    // 生成 JWT 令牌
    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }
  async getInfo(userid: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userid,
      },
      relations: {
        roles: true,
        works: true,
      },
    });
    if (!user) {
      throw new ConflictException('用户不存在');
    }
    return user;
  }
}
