import { Conversation } from 'src/conversations/entities/conversation.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 模型提供方
 */
@Entity()
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  model: string;
  @Column({ nullable: true })
  avatar: string;
  @OneToMany(() => Conversation, (conversation) => conversation.provider)
  conversations: Conversation[];
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
