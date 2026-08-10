import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * 全局 Prisma 模块
 *
 * @hgbord/database 导出的 prisma 单例。NestJS 各处注入 PrismaClient 即可。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

@Global()
@Module({
  providers: [{ provide: PrismaClient, useValue: prisma }],
  exports: [PrismaClient],
})
export class PrismaModule {}
