import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type {
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { AiChatService } from './ai-chat.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from 'src/user/constants';
import { UserStatus } from 'src/user/entities/user.entity';
import {
  MessageState,
  MessageType,
  Role,
} from 'src/messages/entities/message.entity';
import { MessageList } from './type/type';
import OpenAI from 'openai';

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

  constructor(
    private readonly aiChatService: AiChatService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // 记录连接与用户的映射，便于断开时清理和按用户分组推送
  private readonly userByClient = new Map<string, number>();
  // 记录每个会话的流式请求控制器，支持用户主动中断
  private readonly streamControllers = new Map<string, AbortController>();
  private readonly openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.API_KEY,
  });
  // 从握手中提取 token：支持 auth.token / headers.authorization / query.token
  private extractToken(client: Socket): string | null {
    const authToken = (client.handshake as any)?.auth?.token as
      | string
      | undefined;
    const header = client.handshake.headers?.authorization;
    const queryToken = (client.handshake.query as any)?.token as
      | string
      | undefined;
    const bearer =
      header && header.startsWith('Bearer ') ? header.slice(7) : undefined;
    return authToken || bearer || queryToken || null;
  }

  // 客户端连接建立后，主动通知连接成功
  async handleConnection(client: Socket) {
    const token = this.extractToken(client);

    if (!token) {
      client.emit('chat:error', {
        code: 'UNAUTHORIZED',
        message: '缺少 token',
      });
      client.disconnect(true);
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const user = await this.userService.findOne(payload.sub);
      if (user.status === UserStatus.DISABLED) {
        client.emit('chat:error', {
          code: 'FORBIDDEN',
          message: '用户已被禁用',
        });
        client.disconnect(true);
        return;
      }
      this.userByClient.set(client.id, user.id);
      client.join(`user:${user.id}`);
      client.emit('chat:connected', { id: client.id, userId: user.id });
    } catch (e) {
      client.emit('chat:error', {
        code: 'UNAUTHORIZED',
        message: 'token 无效',
      });
      client.disconnect(true);
    }
  }

  // 断开连接：清理用户映射并退出房间
  handleDisconnect(client: Socket) {
    const userId = this.userByClient.get(client.id);
    if (userId) {
      client.leave(`user:${userId}`);
      this.userByClient.delete(client.id);
    }
  }

  /**
   * 初始化会话：前端通过 socket.emit('chat:create', { userId, providerId, title }) 调用
   * @param client 当前连接的客户端
   * @param payload userId(可选) / providerId / title
   * 成功后返回事件：chat:conversationCreated
   */
  @SubscribeMessage('chat:create')
  async createConversation(client: Socket, { content = '' }) {
    const token = this.extractToken(client);

    if (!token) {
      client.emit('chat:error', {
        code: 'UNAUTHORIZED',
        message: '缺少 token',
      });
      client.disconnect(true);
      return;
    }
    let userId: number;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      userId = payload.sub;
    } catch (error) {
      client.emit('chat:error', {
        code: 'UNAUTHORIZED',
        message: 'token 无效',
      });
      client.disconnect(true);
      return;
    }
    try {
      const { conversationId, model } =
        await this.aiChatService.initConversation(userId, content);
      if (!process.env.API_KEY) {
        client.emit('chat:error', {
          code: 'CONFIG_ERROR',
          message: '服务未配置 API_KEY',
        });
        client.disconnect(true);
        return;
      }
      if (!model) {
        client.emit('chat:error', {
          code: 'BAD_PROVIDER',
          message: '模型未配置或不可用',
        });
        return;
      }
      await this.aiChatService.sendUserMessage({
        conversationId,
        text: content,
        role: Role.User,
        type: MessageType.Question,
        state: MessageState.Finished,
      });
      const messageList: MessageList[] = [
        {
          role: Role.System,
          content:
            '你是一名资深作家,用于帮助别人进行创作。同时你还阅读大量书籍，可以根据用户的需求推荐书籍。',
        },
      ];
      messageList.push({
        role: Role.User,
        content,
      });
      const { messageId } = await this.aiChatService.sendUserMessage({
        conversationId,
        text: '',
        role: Role.Assistant,
        type: MessageType.Answer,
        state: MessageState.Stream,
      });
      let answerMessage = '';
      let chunksSinceSave = 0;
      client.emit('chat:conversationCreated', { conversationId });
      console.log('conversationId', conversationId);
      console.log(model, 'model');

      const controller = new AbortController();
      const key = `${client.id}:${conversationId}`;
      this.streamControllers.set(key, controller);
      const completion = await this.openai.chat.completions.create(
        {
          model: model,
          messages: messageList,
          stream: true,
        },
        { signal: controller.signal },
      );
      let gotFirstChunk = false;
      const timeout = setTimeout(() => {
        if (!gotFirstChunk) {
          client.emit('chat:error', {
            code: 'STREAM_TIMEOUT',
            message: '模型响应超时',
          });
        }
      }, 20000);
      try {
        for await (const part of completion) {
          const choice = part.choices?.[0];
          const chunk = choice?.delta?.content || '';
          gotFirstChunk = gotFirstChunk || Boolean(chunk);

          const done =
            choice?.finish_reason === 'stop' ||
            choice?.finish_reason === 'length';
          if (chunk) {
            answerMessage += chunk;
            chunksSinceSave += 1;
            if (chunksSinceSave >= 10) {
              await this.aiChatService.updateMessage({
                messageId,
                content: answerMessage,
                state: MessageState.Stream,
              });
              chunksSinceSave = 0;
            }
          }

          this.server.to(`user:${userId}`).emit('chat:stream', { chunk, done });
        }
      } catch (streamErr) {
        const aborted =
          (streamErr as any)?.name === 'AbortError' ||
          /abort/i.test(String(streamErr));
        if (aborted) {
          client.emit('chat:aborted', { conversationId });
          await this.aiChatService.updateMessage({
            messageId,
            content: answerMessage,
            state: MessageState.Finished,
          });
        } else {
          client.emit('chat:error', {
            code: 'STREAM_ERROR',
            message: '模型流式响应异常',
          });
          client.disconnect(true);
        }
        return;
      } finally {
        clearTimeout(timeout);
        this.streamControllers.delete(key);
      }
      await this.aiChatService.updateMessage({
        messageId,
        content: answerMessage,
        state: MessageState.Finished,
      });
    } catch (error) {
      client.emit('chat:error', {
        code: 'SERVER_ERROR',
        message: '服务异常',
      });
      client.disconnect(true);
      return;
    }

    // const { conversationId } = await this.aiChatService.initConversation(
    //   payload.userId ?? 0,
    //   payload.providerId,
    //   payload.title,
    // );
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
  async sendMessage(
    client: Socket,
    { conversationId, content }: { conversationId: number; content: string },
  ) {
    if (!conversationId || !content) {
      client.emit('chat:error', {
        code: 'BAD_REQUEST',
        message: '缺少 conversationId 或 content',
      });
      return;
    }
    //先将用户消息保存到数据库
    await this.aiChatService.sendUserMessage({
      conversationId,
      text: content,
      role: Role.User,
      type: MessageType.Question,
      state: MessageState.Finished,
    });
    //获取对应的上下文
    const { messageList, model } =
      await this.aiChatService.getHistory(conversationId);
    //先将回答模板添加到数据库
    const { messageId } = await this.aiChatService.sendUserMessage({
      conversationId,
      text: '',
      role: Role.Assistant,
      type: MessageType.Answer,
      state: MessageState.Stream,
    });
    const userId = this.userByClient.get(client.id);
    let answerMessage = '';
    let chunksSinceSave = 0;
    const controller = new AbortController();
    const key = `${client.id}:${conversationId}`;
    this.streamControllers.set(key, controller);
    const completion = await this.openai.chat.completions.create(
      { model: model, messages: messageList, stream: true },
      { signal: controller.signal },
    );
    let gotFirstChunk = false;
    const timeout = setTimeout(() => {
      if (!gotFirstChunk) {
        client.emit('chat:error', {
          code: 'STREAM_TIMEOUT',
          message: '模型响应超时',
        });
      }
    }, 20000);
    try {
      for await (const part of completion) {
        const choice = part.choices?.[0];
        const chunk = choice?.delta?.content || '';
        gotFirstChunk = gotFirstChunk || Boolean(chunk);
        const done =
          choice?.finish_reason === 'stop' ||
          choice?.finish_reason === 'length';
        if (chunk) {
          answerMessage += chunk;
          chunksSinceSave += 1;
          if (chunksSinceSave >= 10) {
            await this.aiChatService.updateMessage({
              messageId,
              content: answerMessage,
              state: MessageState.Stream,
            });
            chunksSinceSave = 0;
          }
        }
        const target = userId ? this.server.to(`user:${userId}`) : client;
        target.emit('chat:stream', { chunk, done });
      }
    } catch (streamErr) {
      const aborted =
        (streamErr as any)?.name === 'AbortError' ||
        /abort/i.test(String(streamErr));
      if (aborted) {
        client.emit('chat:aborted', { conversationId });
        await this.aiChatService.updateMessage({
          messageId,
          content: answerMessage,
          state: MessageState.Finished,
        });
      } else {
        client.emit('chat:error', {
          code: 'STREAM_ERROR',
          message: '模型流式响应异常',
        });
        client.disconnect(true);
      }
      return;
    } finally {
      clearTimeout(timeout);
      this.streamControllers.delete(key);
    }
    //将回答保存到数据库
    await this.aiChatService.updateMessage({
      messageId,
      content: answerMessage,
      state: MessageState.Finished,
    });
  }

  /**
   * 中断对话：前端通过 socket.emit('chat:abort', { conversationId }) 调用
   * 服务端会尝试取消对应会话的流式请求
   */
  @SubscribeMessage('chat:abort')
  async abortConversation(client: Socket, payload: { conversationId: number }) {
    const key = `${client.id}:${payload.conversationId}`;
    const controller = this.streamControllers.get(key);
    if (controller) {
      controller.abort();
      // 删除映射交由 finally 清理，这里容忍重复删除
      this.streamControllers.delete(key);
      client.emit('chat:aborted', { conversationId: payload.conversationId });
    } else {
      client.emit('chat:aborted', {
        conversationId: payload.conversationId,
        noop: true,
      });
    }
  }

  /**
   * 拉取历史：前端通过 socket.emit('chat:history', { conversationId }) 调用
   * @param client 当前连接的客户端
   * @param payload conversationId
   * 成功后返回事件：chat:history（当前为空数组，占位）
   */
  @SubscribeMessage('chat:history')
  async getHistory(client: Socket, payload: { conversationId: number }) {
    const { messageList, model } = await this.aiChatService.getHistory(
      payload.conversationId,
    );
    client.join(`conversation:${payload.conversationId}`);
    client.emit('chat:history', { messageList, model });
  }
}
