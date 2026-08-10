import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { Request } from 'express';
import { Permission, Role } from '@hgbord/shared';

/** 从 JWT payload 注入的当前用户对象（见 JwtStrategy） */
export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  role: Role;
  status: string;
}

/** @CurrentUser() —— 取当前登录用户 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | unknown => {
    const req = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    return data ? req.user?.[data] : req.user;
  },
);

/** 标记接口需要的角色（RolesGuard 读取） */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** 标记接口需要的权限点（PermissionsGuard 读取） */
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...perms: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, perms);

/** 标记此接口是公开的（跳过 JWT 校验） */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
