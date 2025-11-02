import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor() {}

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: 'localhost', // 改为本地主机地址
        port: 6379,
        password: '',
        // 重试配置
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      // 监听连接事件
      this.client.on('connect', () => {
        this.logger.log('Redis 连接成功');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis 连接错误:', error);
      });

      // 测试连接
      await this.client.ping();
      this.logger.log('Redis 服务已就绪');
    } catch (error) {
      this.logger.error('Redis 初始化失败:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis 连接已关闭');
    }
  }

  /**
   * 设置键值对，可设置过期时间（秒）
   */
  async set(
    key: string,
    value: string,
    expireInSeconds?: number,
  ): Promise<void> {
    if (expireInSeconds) {
      await this.client.setex(key, expireInSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * 获取值
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * 删除键
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置键的过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
}
