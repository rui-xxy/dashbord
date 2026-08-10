import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exception.filter';

async function bootstrap() {
  // 加载根目录 .env（原型阶段不引 dotenv 依赖，tsx 直接读 node 进程 env）
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
