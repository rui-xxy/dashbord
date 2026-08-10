import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators';
import { Errors } from './app-exception';
import type { AuthUser } from './decorators';

/**
 * JWT 守卫 —— 校验 Authorization: Bearer <token>
 *
 * 公开接口（@Public()）直接放行。
 * 校验通过后把 user 挂到 req.user，后续 @CurrentUser / RolesGuard 使用。
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const auth = req.headers.authorization ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) throw Errors.unauthorized();

    try {
      const payload = await this.jwt.verifyAsync<{ user: AuthUser }>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      req.user = payload.user;
      return true;
    } catch {
      throw Errors.unauthorized('登录已过期，请重新登录');
    }
  }
}
