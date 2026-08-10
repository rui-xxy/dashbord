import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';

/**
 * 加载根目录 .env —— 不引 dotenv 依赖，用几行 fs 手动解析。
 * 找不到文件时静默跳过（靠进程 env 注入也行）。
 */
function loadEnvFile() {
  // 从 apps/api 向上两层到仓库根
  const envPath = resolve(__dirname, '../../../.env');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      // 去掉两端引号
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env 不存在时静默（依赖进程 env）
  }
}
loadEnvFile();

async function bootstrap() {
  const port = Number(process.env.API_PORT ?? 4000);

  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(port);
  console.log(`\n  ✓  API 服务已启动 → http://localhost:${port}/api\n`);
}

bootstrap().catch((e) => {
  console.error('启动失败:', e);
  process.exit(1);
});
