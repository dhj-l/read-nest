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

// WebSocket 网关：
// - namespace: 前端连接地址为 http://localhost:3000/demo
// - cors: 允许任意来源连接，便于本地演示
@WebSocketGateway({ namespace: '/demo', cors: { origin: '*' } })
export class DemoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // 记录每个连接对应的定时器，便于断开时清理，避免内存泄漏
  private timers = new Map<string, NodeJS.Timeout>();

  // 客户端成功建立连接时触发：
  // - 给该客户端发送一个 "connected" 事件，携带它的 socket id
  // - 每 3 秒主动向该客户端推送一个 "tick" 事件，演示服务端主动消息
  handleConnection(client: Socket) {
    client.emit('connected', { id: client.id });
    const t = setInterval(() => {
      client.emit('tick', { time: Date.now() });
    }, 3000);
    this.timers.set(client.id, t);
  }

  // 客户端断开连接时触发：清理对应的定时器
  handleDisconnect(client: Socket) {
    const t = this.timers.get(client.id);
    if (t) clearInterval(t);
    this.timers.delete(client.id);
  }

  // 前端通过 socket.emit('echo', { text: '内容' }) 发送到服务器：
  // - 第一个参数是事件名 'echo'
  // - 第二个参数是负载对象 payload，这里类型为 { text: string }
  // 服务器接收后，通过 client.emit('echo:reply', ...) 单独回复该客户端
  @SubscribeMessage('echo')
  onEcho(client: Socket, payload: { text: string }) {
    client.emit('echo:reply', { text: payload.text });
  }

  // 前端通过 socket.emit('notifyAll', { message: '广播内容' }) 发送到服务器：
  // - 服务器使用 this.server.emit(...) 广播到所有连接在该 namespace 的客户端
  // - 客户端可监听 'notify' 事件接收广播
  @SubscribeMessage('notifyAll')
  onNotifyAll(client: Socket, payload: { message: string }) {
    this.server.emit('notify', { from: client.id, message: payload.message });
  }
}
