import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation]), UserModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
