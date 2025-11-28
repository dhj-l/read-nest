import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { TtsService } from './tts.service';
import type { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: true, credentials: true },
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  constructor(private readonly ttsService: TtsService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway 已初始化');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`客户端连接成功: id=${client.id}`);
  }

  /**
   * 处理客户端断开连接
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`客户端断开: id=${client.id}`);
  }

  // 无认证，所有连接均可使用

  // ========================= 事件处理示例 =========================

  @SubscribeMessage('ping')
  handlePing(
    client: Socket,
    _payload?: unknown,
    ack?: (data: { message: string; ts: number }) => void,
  ) {
    const data = { message: 'pong', ts: Date.now() };
    if (ack) return ack(data);
    client.emit('pong', data);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    client: Socket,
    payload: { room?: string },
    ack?: (data: { ok: boolean; error?: string }) => void,
  ) {
    const room = payload?.room?.trim();
    if (!room) return ack?.({ ok: false, error: '房间名不能为空' });
    await client.join(room);
    ack?.({ ok: true });
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    client: Socket,
    payload: { room?: string },
    ack?: (data: { ok: boolean; error?: string }) => void,
  ) {
    const room = payload?.room?.trim();
    if (!room) return ack?.({ ok: false, error: '房间名不能为空' });
    await client.leave(room);
    ack?.({ ok: true });
  }

  @SubscribeMessage('chat')
  chat(
    client: Socket,
    payload: { room?: string; message?: string },
    ack?: (data: { ok: boolean; error?: string }) => void,
  ) {
    const room = payload?.room?.trim();
    const message = payload?.message?.trim();
    if (!room || !message) {
      return ack?.({ ok: false, error: 'room 与 message 均不能为空' });
    }

    this.server.to(room).emit('chat', {
      room,
      message,
      ts: Date.now(),
    });
    ack?.({ ok: true });
  }

  @SubscribeMessage('tts:request')
  async ttsRequest(
    client: Socket,
    payload: {
      text?: string;
      voice?: string;
      aue?: 'lame' | 'raw';
      noCache?: boolean;
    },
    ack?: (data: {
      ok: boolean;
      audioBase64?: string;
      mime?: string;
      voice?: string;
      error?: string;
    }) => void,
  ) {
    const text = payload?.text?.trim();
    if (!text) return ack?.({ ok: false, error: 'text 不能为空' });
    try {
      const { audioBase64, mime, vcn } = await this.ttsService.synthesize(
        text,
        {
          vcn: payload?.voice,
          aue: payload?.aue,
          noCache: payload?.noCache,
        },
      );
      const res = { ok: true, audioBase64, mime, voice: vcn };
      if (ack) return ack(res);
      client.emit('tts:response', res);
    } catch (e) {
      const msg = (e as Error)?.message ?? 'TTS 失败';
      if (ack) return ack({ ok: false, error: msg });
      client.emit('tts:error', { error: msg });
    }
  }

  broadcastSystemNotice(text: string) {
    this.server.emit('system:notice', { text, ts: Date.now() });
  }
}
