import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import {
  Message,
  MessageState,
  MessageType,
  Role,
} from 'src/messages/entities/message.entity';
import { Provider } from 'src/providers/entities/provider.entity';
import { User } from 'src/user/entities/user.entity';
import type { Repository } from 'typeorm';

/**
 * AI 对话服务（占位实现）
 * - 负责会话初始化、消息写入、历史查询等业务逻辑
 * - 目前仅提供接口骨架，返回占位结果，便于后续替换为真实实现
 */
@Injectable()
export class AiChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
    @InjectRepository(Provider)
    private readonly providersRepo: Repository<Provider>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  /**
   * 初始化一个新的会话
   * @returns 返回占位的会话 ID
   */
  async initConversation(userId: number, content: string) {
    try {
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      const provider = await this.providersRepo.findOne({
        where: { model: 'deepseek-chat' },
      });
      if (!user) {
        throw new BadRequestException('用户不存在');
      }
      if (!provider) {
        throw new BadRequestException('模型提供方不存在');
      }
      const conversation = this.conversationsRepo.create({
        user,
        title: content.slice(0, 10),
        provider,
      });
      const savedConversation = await this.conversationsRepo.save(conversation);
      return { conversationId: savedConversation.id, model: provider.model };
    } catch (error) {
      throw new BadRequestException('初始化会话失败');
    }
  }

  /**
   * 保存用户发送的消息
   * @param conversationId 会话 ID
   * @param text 文本内容
   * @returns 返回占位的消息 ID
   */
  async sendUserMessage({
    conversationId,
    text,
    state = MessageState.Finished,
    role = Role.User,
    type = MessageType.Question,
  }: {
    conversationId: number;
    text: string;
    state?: MessageState;
    role?: Role;
    type?: MessageType;
  }) {
    try {
      const conversation = await this.conversationsRepo.findOne({
        where: { id: conversationId },
      });
      if (!conversation) {
        throw new BadRequestException('会话不存在');
      }
      const message = this.messagesRepo.create({
        conversation,
        type,
        state,
        message: text,
        role,
      });
      const savedMessage = await this.messagesRepo.save(message);
      return { messageId: savedMessage.id };
    } catch (error) {
      throw new BadRequestException('保存用户消息失败');
    }
  }

  async updateMessage({
    messageId,
    content,
    state,
  }: {
    messageId: number;
    content: string;
    state: MessageState;
  }) {
    try {
      const message = await this.messagesRepo.findOne({
        where: { id: messageId },
      });
      if (!message) {
        throw new BadRequestException('消息不存在');
      }
      message.message = content;
      message.state = state;
      await this.messagesRepo.save(message);
      return { messageId };
    } catch (error) {
      throw new BadRequestException('更新消息失败');
    }
  }

  /**
   * 查询会话历史消息
   * @param conversationId 会话 ID
   * @returns 消息数组（占位为空）
   */
  async getHistory(conversationId: number) {
    const messages = await this.messagesRepo.find({
      where: {
        conversation: { id: conversationId },
      },
      relations: ['conversation', 'conversation.provider'],
      order: { createTime: 'ASC' },
    });
    const messageList = messages.map((item) => {
      return {
        role: item.role,
        content: item.message,
      };
    });

    let model = 'deepseek-chat';
    if (messages.length > 0) {
      model = messages[0].conversation?.provider?.model || model;
    } else {
      const conv = await this.conversationsRepo.findOne({
        where: { id: conversationId },
        relations: ['provider'],
      });
      model = conv?.provider?.model || model;
    }
    return { messageList, model };
  }
}
