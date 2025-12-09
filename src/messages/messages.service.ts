import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
  ) {}
  create(createMessageDto: CreateMessageDto) {
    return 'This action adds a new message';
  }

  async findAll(conversationId: number) {
    console.log(conversationId);

    try {
      const conversation = await this.conversationsRepository.findOne({
        where: {
          id: conversationId,
        },
      });
      if (!conversation) {
        throw new BadRequestException('对话记录不存在');
      }
      return await this.messagesRepository.find({
        where: {
          conversation: {
            id: conversationId,
          },
        },
        order: { createTime: 'ASC' },
      });
    } catch (error) {
      throw new BadRequestException(error.message || '获取对话记录失败');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
