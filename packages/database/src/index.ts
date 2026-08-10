import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient 单例
 *
 * 开发模式下 Next.js / NestJS 热重载会反复创建实例，
 * 把它挂在 globalThis 上避免连接耗尽。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type { PrismaClient } from '@prisma/client';
