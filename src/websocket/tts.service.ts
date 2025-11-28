import { Injectable } from '@nestjs/common';
import { createHmac, createHash } from 'crypto';
import { RedisService } from '../redis/redis.service';
type WsModule = any;

export interface TtsOptions {
  vcn?: string;
  aue?: 'lame' | 'raw';
  noCache?: boolean;
}

export interface TtsResult {
  audioBase64: string;
  mime: string;
  vcn: string;
}

@Injectable()
export class TtsService {
  private readonly hostUrl = 'wss://tts-api.xfyun.cn/v2/tts';
  private readonly host = 'tts-api.xfyun.cn';
  private readonly uri = '/v2/tts';

  constructor(private readonly redis: RedisService) {}

  async synthesize(text: string, options: TtsOptions = {}): Promise<TtsResult> {
    const appid = process.env.XFYUN_TTS_APPID;
    const apiKey = process.env.XFYUN_TTS_API_KEY;
    const apiSecret = process.env.XFYUN_TTS_API_SECRET;
    if (!appid || !apiKey || !apiSecret) {
      throw new Error('讯飞 TTS 环境变量未配置');
    }

    const date = new Date().toUTCString();
    const authorization = this.getAuthStr(date, apiKey, apiSecret);
    const wssUrl = `${this.hostUrl}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${this.host}`;

    const WS: WsModule = eval('require')('ws');
    const ws = new WS(wssUrl);
    const chunks: Buffer[] = [];
    const defaultVoice = process.env.XFYUN_TTS_DEFAULT_VOICE ?? 'x4_xiaoyan';
    const whitelistRaw = process.env.XFYUN_TTS_VOICE_WHITELIST ?? '';
    const whitelist = whitelistRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const defaultAue = process.env.XFYUN_TTS_DEFAULT_AUE ?? 'lame';

    let aue: 'lame' | 'raw' =
      (options.aue ?? defaultAue) === 'raw' ? 'raw' : 'lame';
    let vcn = (options.vcn ?? defaultVoice).trim();
    if (whitelist.length && !whitelist.includes(vcn)) {
      vcn = defaultVoice;
    }

    const mime = aue === 'lame' ? 'audio/mpeg' : 'audio/L16;rate=16000';

    const cacheKey = this.buildCacheKey(text, vcn, aue);
    const ttl = Number(process.env.XFYUN_TTS_CACHE_TTL ?? 86400);

    if (!options.noCache) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as TtsResult;
          if (
            parsed &&
            typeof parsed.vcn === 'string' &&
            parsed.audioBase64 &&
            parsed.mime
          ) {
            return parsed;
          }
        } catch {}
      }
    }

    return await new Promise<TtsResult>((resolve, reject) => {
      ws.on('open', () => {
        const frame: any = {
          common: { app_id: appid },
          business: { aue, vcn, tte: 'UTF8' },
          data: { text: Buffer.from(text).toString('base64'), status: 2 },
        };
        if (aue === 'raw') {
          frame.business.auf = 'audio/L16;rate=16000';
        }
        ws.send(JSON.stringify(frame));
      });

      ws.on('message', (data: Buffer) => {
        try {
          const res = JSON.parse(data.toString());
          if (res.code !== 0) {
            reject(new Error(`${res.code}: ${res.message}`));
            ws.close();
            return;
          }
          const audio: string = res?.data?.audio ?? '';
          if (audio) {
            chunks.push(Buffer.from(audio, 'base64'));
          }
          if (res?.data?.status === 2) {
            ws.close();
          }
        } catch (e) {
          reject(e as Error);
          ws.close();
        }
      });

      ws.on('close', async () => {
        const buf = Buffer.concat(chunks);
        const result: TtsResult = {
          audioBase64: buf.toString('base64'),
          mime,
          vcn,
        };
        if (!options.noCache) {
          try {
            await this.redis.set(cacheKey, JSON.stringify(result), ttl);
          } catch {}
        }
        resolve(result);
      });

      ws.on('error', (err) => {
        reject(err);
      });
    });
  }

  private getAuthStr(date: string, apiKey: string, apiSecret: string): string {
    const signatureOrigin = `host: ${this.host}\ndate: ${date}\nGET ${this.uri} HTTP/1.1`;
    const signatureSha = createHmac('sha256', apiSecret)
      .update(signatureOrigin)
      .digest('base64');
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
    return Buffer.from(authorizationOrigin, 'utf-8').toString('base64');
  }

  private buildCacheKey(text: string, vcn: string, aue: string): string {
    const hash = createHash('sha1').update(text).digest('hex');
    return `tts:${vcn}:${aue}:${hash}`;
  }
}
