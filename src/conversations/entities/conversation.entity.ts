import { Message } from 'src/messages/entities/message.entity';
import { Provider } from 'src/providers/entities/provider.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 会话记录
 */
@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Index()
  @ManyToOne(() => Provider, (provider) => provider.conversations, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;
  @Index()
  @ManyToOne(() => User, (user) => user.conversations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
  @CreateDateColumn()
  createTime: Date;
  @UpdateDateColumn()
  updateTime: Date;
}
