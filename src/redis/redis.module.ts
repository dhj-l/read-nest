import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // 设置为全局模块，这样其他模块都可以使用
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
