import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

/**
 * 全局异常过滤器 —— 统一错误响应格式
 *
 * 输出：{ code: string|number, data: null, message: string }
 *
 * 处理三类错误：
 *  1. HttpException（含自定义 AppException）—— 用其 status 与 message
 *  2. ZodError —— 400，message 取首个校验错误
 *  3. Prisma 错误 —— 唯一约束冲突 → 409；其余 → 500
 *  4. 其他 —— 500
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(err: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string | number = 'INTERNAL_ERROR';
    let message = '服务器内部错误';

    if (err instanceof HttpException) {
      status = err.getStatus();
      const resp = err.getResponse();
      if (typeof resp === 'string') {
        message = resp;
      } else if (typeof resp === 'object' && resp !== null) {
        const r = resp as Record<string, unknown>;
        message = (r.message as string) ?? err.message;
        code = (r.code as string | number) ?? status;
      }
    } else if (err instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      message = err.errors[0]?.message ?? '参数校验失败';
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        code = 'DUPLICATE';
        message = '数据已存在（唯一约束冲突）';
      } else {
        code = `PRISMA_${err.code}`;
        message = '数据库操作失败';
      }
    } else if (err instanceof Error) {
      message = err.message;
    }

    if (status >= 500) {
      this.logger.error(`${req.method} ${req.url} → ${status}`, err instanceof Error ? err.stack : String(err));
    }

    res.status(status).json({ code, data: null, message });
  }
}
