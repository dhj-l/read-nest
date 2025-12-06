import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { AiChatService } from './ai-chat.service';

/**
 * AI 对话 WebSocket 网关（占位实现）
 * - 命名空间：/chat（前端连接：http://localhost:3000/chat）
 * - 事件：
 *   - chat:create   初始化会话
 *   - chat:send     发送用户消息（占位示例含流式事件）
 *   - chat:history  拉取历史消息
 * - 当前仅提供事件收发与占位响应，便于前端联调与后续填充业务
 */
@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class AiChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly aiChatService: AiChatService) {}

  // 客户端连接建立后，主动通知连接成功
  handleConnection(client: Socket) {
    client.emit('chat:connected', { id: client.id });
  }

  // 当前无清理逻辑，占位
  handleDisconnect(client: Socket) {}

  /**
   * 初始化会话：前端通过 socket.emit('chat:create', { userId, providerId, title }) 调用
   * @param client 当前连接的客户端
   * @param payload userId(可选) / providerId / title
   * 成功后返回事件：chat:conversationCreated
   */
  @SubscribeMessage('chat:create')
  async createConversation(
    client: Socket,
    payload: { userId?: number; providerId: number; title: string },
  ) {
    const { conversationId } = await this.aiChatService.initConversation(
      payload.userId ?? 0,
      payload.providerId,
      payload.title,
    );
    client.emit('chat:conversationCreated', { conversationId });
  }

  /**
   * 发送消息：前端通过 socket.emit('chat:send', { conversationId, text }) 调用
   * @param client 当前连接的客户端
   * @param payload conversationId / text
   * 占位响应：
   * - chat:accepted 立即确认已接收
   * - chat:stream   演示流式推送（当前直接返回 done: true）
   */
  @SubscribeMessage('chat:send')
  async sendMessage(client: Socket, payload: { conversationId: number; text: string }) {
    client.emit('chat:accepted', { conversationId: payload.conversationId });
    // 占位：真实实现中这里会逐块推送模型响应内容
    this.server.to(client.id).emit('chat:stream', { chunk: '', done: true });
  }

  /**
   * 拉取历史：前端通过 socket.emit('chat:history', { conversationId }) 调用
   * @param client 当前连接的客户端
   * @param payload conversationId
   * 成功后返回事件：chat:history（当前为空数组，占位）
   */
  @SubscribeMessage('chat:history')
  async getHistory(client: Socket, payload: { conversationId: number }) {
    const { messages } = await this.aiChatService.getHistory(payload.conversationId);
    client.emit('chat:history', { messages });
  }
}
