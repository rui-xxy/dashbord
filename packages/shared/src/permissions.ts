import { Role, ROLE_RANK } from './enums';

/**
 * 权限系统 —— 简化版 RBAC
 *
 * 设计原则：
 * 1. 角色用枚举字段（单角色/用户），不建权限表 —— 原型阶段 YAGNI
 * 2. 权限点在代码里定义，前后端共用，类型安全
 * 3. 后端守卫强制校验，前端判断只是体验优化（隐藏按钮等）
 * 4. 未来要细粒度权限，再加 Role/Permission/RolePermission 三张表，不影响现有模型
 */

/** 所有权限点 */
export const Permission = {
  // 用户管理
  USER_VIEW: 'user:view', // 查看用户列表
  USER_CREATE: 'user:create', // 创建用户
  USER_UPDATE: 'user:update', // 编辑用户资料
  USER_UPDATE_ROLE: 'user:update:role', // 修改角色（仅超管）
  USER_UPDATE_STATUS: 'user:update:status', // 停用/启用
  USER_DELETE: 'user:delete', // 删除用户（仅超管）
  // 表单管理
  FORM_MANAGE: 'form:manage', // 表单 CRUD
  // 系统
  SYSTEM_CONFIG: 'system:config', // 系统配置
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/** 角色 → 权限点矩阵 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_UPDATE_ROLE,
    Permission.USER_UPDATE_STATUS,
    Permission.USER_DELETE,
    Permission.FORM_MANAGE,
    Permission.SYSTEM_CONFIG,
  ],
  [Role.ADMIN]: [
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_UPDATE_STATUS,
    Permission.FORM_MANAGE,
  ],
  [Role.MANAGER]: [Permission.USER_VIEW, Permission.FORM_MANAGE],
  [Role.STAFF]: [Permission.FORM_MANAGE],
};

// ──────────────────────────────────────────────────────────
// 层级比较工具
// ──────────────────────────────────────────────────────────

/** roleA 的层级是否 >= roleB（>= 表示同等或更高） */
export function gte(a: Role, b: Role): boolean {
  return ROLE_RANK.indexOf(a) <= ROLE_RANK.indexOf(b);
}

/** roleA 的层级是否 > roleB（严格更高） */
export function gt(a: Role, b: Role): boolean {
  return ROLE_RANK.indexOf(a) < ROLE_RANK.indexOf(b);
}

/** actor（操作者）是否有权限对 target（被操作者）执行 perm 操作 */
export function can(actorRole: Role, perm: Permission, targetRole?: Role): boolean {
  const allowed = ROLE_PERMISSIONS[actorRole]?.includes(perm);
  if (!allowed) return false;
  // 涉及目标用户时，actor 必须严格高于 target（同级不能互相操作）
  if (targetRole) return gt(actorRole, targetRole);
  return true;
}

/** 该角色是否拥有某权限（不看目标） */
export function hasPermission(role: Role, perm: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}
