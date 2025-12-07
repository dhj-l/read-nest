import { Role } from 'src/messages/entities/message.entity';

export interface MessageList {
  role: Role;
  content: string;
}
