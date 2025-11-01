import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { type FindUser } from './type/type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(query: FindUser) {
    const { username = '', page = 1, pageSize = 10 } = query;
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'username', 'email', 'avatar_url', 'status', 'roles'],
      where: {
        username: Like(`%${username}%`),
        status: UserStatus.ACTIVE,
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
    user.username = `disabled_${user.username}`;
    return await this.userRepository.save(user);
  }
}
