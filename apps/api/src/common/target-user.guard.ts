import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators';
import { Errors } from './app-exception';
import type { AuthUser } from './decorators';

/**
 * 目标用户预加载守卫 —— 让 PermissionsGuard 的层级判断真正接上线
 *
 * 职责：对带 :id 参数的用户路由，从数据库查出目标用户挂到 req.targetUser。
 * 之后 PermissionsGuard 里的 can(actorRole, perm, targetRole) 会做严格层级判断
 * （gt：actor 必须严格高于 target，同级不能互相操作）。
 *
 * 规则：
 * - 目标不存在 → 404（比 service 层更早拦截）
 * - 目标是自己 → 不挂 targetUser（自我操作不受层级限制，改自己资料永远允许；
 *   删自己/停自己由 service 层的业务规则另行拦截）
 * - @Public() 路由直接放行（不查库）
 *
 * 必须注册在 UserModule 的 providers 里（PrismaModule 是 @Global，可直接注入），
 * 且在 @UseGuards 链中排在 PermissionsGuard 之前。
 */
@Injectable()
export class TargetUserGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaClient,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<
      Request & { user?: AuthUser; targetUser?: { id: string; role: string } }
    >();
    const targetId = req.params?.id;
    // 没有 :id 参数的路由（如列表/创建）不涉及目标用户
    if (!targetId) return true;

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });
    if (!target) throw Errors.notFound('用户不存在');

    // 目标是自己 → 不挂 targetUser，跳过层级判断
    if (req.user && target.id === req.user.id) return true;

    req.targetUser = target;
    return true;
  }
}
