import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Provider } from 'src/providers/entities/provider.entity';
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
  ) {}

  /**
   * 初始化一个新的会话
   * @param userId 用户 ID（可用于关联会话归属）
   * @param providerId 模型提供方 ID（用于选择具体的 AI 模型）
   * @param title 会话标题
   * @returns 返回占位的会话 ID
   */
  async initConversation(
    userId: number,
    providerId: number,
    title: string,
  ): Promise<{ conversationId: number }> {
    // 占位：声明依赖已注入，避免未使用的告警；真实实现中将使用这些仓库进行落库
    void this.conversationsRepo.target;
    void this.providersRepo.target;

    // 真实实现示例（后续替换）：
    // const provider = await this.providersRepo.findOne({ where: { id: providerId } });
    // const conv = this.conversationsRepo.create({ user: { id: userId } as any, provider, title });
    // const saved = await this.conversationsRepo.save(conv);
    // return { conversationId: saved.id };

    return { conversationId: 0 };
  }

  /**
   * 保存用户发送的消息
   * @param conversationId 会话 ID
   * @param text 文本内容
   * @returns 返回占位的消息 ID
   */
  async sendUserMessage(
    conversationId: number,
    text: string,
  ): Promise<{ messageId: number }> {
    void this.messagesRepo.target;

    // 真实实现示例（后续替换）：
    // const msg = this.messagesRepo.create({ conversation: { id: conversationId } as any, type: MessageType.Question, state: MessageState.Stream, message: text });
    // const saved = await this.messagesRepo.save(msg);
    // return { messageId: saved.id };

    return { messageId: 0 };
  }

  /**
   * 查询会话历史消息
   * @param conversationId 会话 ID
   * @returns 消息数组（占位为空）
   */
  async getHistory(conversationId: number): Promise<{ messages: Message[] }> {
    // 真实实现示例（后续替换）：
    // const messages = await this.messagesRepo.find({ where: { conversation: { id: conversationId } }, order: { createTime: 'ASC' } });
    // return { messages };

    return { messages: [] };
  }
}
