import { Injectable } from '@nestjs/common';
import { CreateRecordDto, FindRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Record) private recordRepository: Repository<Record>,
  ) {}
  async findAll(findRecordDto: FindRecordDto) {
    const { userId, workId, page = 1, pageSize = 10 } = findRecordDto;
    const conditions = {
      user: {},
      work: {},
    };
    if (userId) {
      Reflect.set(conditions.user, 'id', userId);
    }
    if (workId) {
      Reflect.set(conditions.work, 'id', workId);
    }
    const [data, total] = await this.recordRepository.findAndCount({
      select: {
        id: true,
        user: {
          id: true,
          username: true,
        },
        work: {
          id: true,
          title: true,
          cover_url: true,
        },
        chapter: {
          id: true,
          name: true,
        },
        createTime: true,
        updateTime: true,
      },
      where: conditions,
      order: {
        id: 'DESC',
      },
      take: pageSize,
      skip: (page - 1) * pageSize,
      relations: ['user', 'work', 'chapter'],
    });
    return {
      data,
      total,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} record`;
  }

  update(id: number, updateRecordDto: UpdateRecordDto) {
    return `This action updates a #${id} record`;
  }

  remove(id: number) {
    return `This action removes a #${id} record`;
  }
}
