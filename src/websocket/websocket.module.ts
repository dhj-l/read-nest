import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { TtsService } from './tts.service';

@Module({
  providers: [WebsocketGateway, TtsService],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
