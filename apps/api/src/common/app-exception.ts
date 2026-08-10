import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常 —— 携带稳定的错误 code 供前端判断
 *
 * 用法：throw new AppException('USER_NOT_FOUND', '用户不存在', 404)
 */
export class AppException extends HttpException {
  constructor(
    public readonly errorCode: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code: errorCode, message }, status);
  }
}

/** 常用错误的快捷工厂 */
export const Errors = {
  unauthorized: (msg = '未登录或登录已过期') =>
    new AppException('UNAUTHORIZED', msg, HttpStatus.UNAUTHORIZED),
  forbidden: (msg = '没有权限执行此操作') =>
    new AppException('FORBIDDEN', msg, HttpStatus.FORBIDDEN),
  notFound: (msg = '资源不存在') =>
    new AppException('NOT_FOUND', msg, HttpStatus.NOT_FOUND),
  badRequest: (msg = '请求参数有误') =>
    new AppException('BAD_REQUEST', msg, HttpStatus.BAD_REQUEST),
  conflict: (msg = '数据冲突') =>
    new AppException('CONFLICT', msg, HttpStatus.CONFLICT),
};
