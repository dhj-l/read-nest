import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private redisService: RedisService) {
    this.createTransporter();
  }

  /**
   * 创建邮件传输器
   */
  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: '3134504258@qq.com',
        //qq邮箱授权码
        pass: 'acixtcdusxtcdfgi',
      },
    });

    // 验证连接配置
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('邮件服务配置错误:', error);
      } else {
        this.logger.log('邮件服务已就绪');
      }
    });
  }

  /**
   * 生成6位数字验证码
   */
  generateVerificationCode(length: number = 6): string {
    const chars = '0123456789';
    let code = '';

    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
  }

  /**
   * 发送验证码邮件
   */
  async sendVerificationCode(email: string): Promise<boolean> {
    try {
      // 检查是否可以发送验证码
      const canSend = await this.canSendVerificationCode(email);
      if (!canSend) {
        throw new BadRequestException('请稍后再试，验证码发送频率过快');
      }

      // 生成验证码
      const code = this.generateVerificationCode();

      const mailOptions = {
        from: '3134504258@qq.com',
        to: email,
        subject: '邮箱验证码 - 阅读网站',
        html: this.generateVerificationEmailTemplate(code),
      };

      // 发送邮件
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`验证码已发送至: ${email}`);

      // 将验证码存储到 Redis，设置1分钟过期
      await this.redisService.set(`verification:${email}`, code, 60);

      return true;
    } catch (error) {
      this.logger.error(`发送验证码邮件失败: ${email}`, error);
      return false;
    }
  }

  /**
   * 验证邮箱验证码
   */
  async verifyCode(email: string, code: string): Promise<boolean> {
    try {
      // 从 Redis 获取验证码
      const storedCode = await this.redisService.get(`verification:${email}`);

      if (!storedCode) {
        this.logger.warn(`验证码不存在或已过期: ${email}`);
        return false;
      }

      // 比较验证码
      const isValid = storedCode === code;

      if (isValid) {
        // 验证成功后删除验证码，防止重复使用
        await this.redisService.del(`verification:${email}`);
        this.logger.log(`验证码验证成功: ${email}`);
      } else {
        this.logger.warn(
          `验证码不匹配: ${email}, 输入: ${code}, 存储: ${storedCode}`,
        );
      }

      return isValid;
    } catch (error) {
      this.logger.error(`验证码验证失败: ${email}`, error);
      return false;
    }
  }

  /**
   * 生成验证码邮件模板
   */
  private generateVerificationEmailTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>邮箱验证码</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">阅读网站</h1>
          </div>
          
          <div style="padding: 30px; background: white;">
              <h2 style="color: #333; margin-top: 0;">邮箱验证码</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                  您好！感谢您注册阅读网站。请使用以下验证码完成注册：
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                  <div style="display: inline-block; padding: 15px 30px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #667eea;">
                      <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">
                          ${code}
                      </span>
                  </div>
              </div>
              
              <p style="color: #999; font-size: 14px; line-height: 1.6;">
                  <strong>温馨提示：</strong><br>
                  • 验证码将在 <strong style="color: #ff6b6b;">1分钟</strong> 后失效，请尽快使用<br>
                  • 如果这不是您本人的操作，请忽略此邮件<br>
                  • 请勿将验证码透露给他人
              </p>
          </div>
          
          <div style="padding: 20px; text-align: center; background: #eee;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                  &copy; 2024 阅读网站. 保留所有权利.
              </p>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * 检查是否可以发送验证码（防止滥用）
   */
  async canSendVerificationCode(email: string): Promise<boolean> {
    try {
      const lastSendTime = await this.redisService.get(
        `verification_time:${email}`,
      );

      if (lastSendTime) {
        const timeDiff = Date.now() - parseInt(lastSendTime);
        // 60秒内只能发送一次
        if (timeDiff < 60 * 1000) {
          return false;
        }
      }

      // 记录本次发送时间
      await this.redisService.set(
        `verification_time:${email}`,
        Date.now().toString(),
        60,
      );
      return true;
    } catch (error) {
      this.logger.error(`检查发送频率失败: ${email}`, error);
      return false;
    }
  }
}
