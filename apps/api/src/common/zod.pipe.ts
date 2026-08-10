import { PipeTransform } from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';
import { Errors } from './app-exception';

/** Zod → NestJS 管道。校验失败抛 BAD_REQUEST。 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}
  transform(value: unknown): T {
    try {
      return this.schema.parse(value) as T;
    } catch (e) {
      if (e instanceof ZodError) {
        throw Errors.badRequest(e.errors[0]?.message ?? '参数校验失败');
      }
      throw e;
    }
  }
}
