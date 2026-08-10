import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { can, Permission, Role } from '@hgbord/shared';
import { PERMISSIONS_KEY } from './decorators';
import { Errors } from './app-exception';
import type { AuthUser } from './decorators';

/**
 * 权限守卫 —— 基于 @hgbord/shared 的 RBAC 矩阵
 *
 * 用法：在 controller 方法上加 @RequirePermissions(Permission.USER_CREATE)
 *
 * 特殊：如果路由 param 里有 id（操作目标用户），守卫会从 DB 取目标用户角色，
 * 校验 actor 是否严格高于 target（同级不能互相操作）。
 *
 * 注意：守卫拿不到 DI 注入的 service，这里用 PrismaClient 直接查。
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  static inject = ['Reflector'];
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(
      PERMISSIONS_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser; prisma?: any; targetUser?: { role: string } }>();
    const actor = req.user;
    if (!actor) throw Errors.unauthorized();

    // 取目标用户角色（如有 :id 参数）—— controller 会预先把 targetUser 挂到 req
    const targetRole = req.targetUser?.role as Role | undefined;

    // 检查每一个需要的权限
    for (const perm of required) {
      if (!can(actor.role, perm, targetRole)) {
        throw Errors.forbidden('你的角色无权执行此操作');
      }
    }
    return true;
  }
}
