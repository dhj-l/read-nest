import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
import { config } from 'dotenv';

async function bootstrap() {
  // 加载环境变量
  config();

  const app = await NestFactory.create(AppModule, {});

  // 全局验证管道配置
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动去除非白名单属性
      // forbidNonWhitelisted: true, // 禁止非白名单属性
      transform: true, // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors();

  // 配置静态文件服务
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
