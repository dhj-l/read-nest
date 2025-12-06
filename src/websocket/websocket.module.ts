import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketGateway } from './websocket.gateway';
import { TtsService } from './tts.service';
import { DemoGateway } from './demo.gateway';
import { AiChatGateway } from './ai-chat.gateway';
import { AiChatService } from './ai-chat.service';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Provider } from 'src/providers/entities/provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Provider])],
  providers: [
    WebsocketGateway,
    TtsService,
    DemoGateway,
    AiChatGateway,
    AiChatService,
  ],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
