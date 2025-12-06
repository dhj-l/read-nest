import { Conversation } from 'src/conversations/entities/conversation.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 消息记录
 */
export enum MessageType {
  /**
   * 问题
   */
  Question = 'question',
  /**
   * 回答
   */
  Answer = 'answer',
}
export enum MessageState {
  /**
   * 加载中
   */
  Loading = 'loading',
  /**
   * 已完成
   */
  Finished = 'finished',
  /**
   * 流式
   */
  Stream = 'stream',
}
export enum role {
  /**
   *助手
   */
  System = 'system',
  /**
   * 用户
   */
  User = 'user',
  /**
   * 回复
   */
  Assistant = 'assistant',
}
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  message: string;
  @Column({ type: 'enum', enum: MessageType })
  type: MessageType;
  @Column({ type: 'enum', enum: MessageState, default: MessageState.Finished })
  state: MessageState;
  @Column({ type: 'enum', enum: role })
  role: role;
  @Index()
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
