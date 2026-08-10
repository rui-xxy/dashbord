/**
 * 角色枚举 —— RBAC 四级层级
 *
 * 顺序即层级：数组中越靠前层级越高。
 * 不要随意调换顺序，permissions.ts 依赖此顺序做层级比较。
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

/** 角色从高到低排列，用于层级比较 */
export const ROLE_RANK: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MANAGER,
  Role.STAFF,
];

/** 角色 → 中文标签 */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: '超级管理员',
  [Role.ADMIN]: '管理员',
  [Role.MANAGER]: '经理',
  [Role.STAFF]: '员工',
};

/** 谁能分配该角色（定义谁能把某人提升到此角色） */
export const ROLE_ASSIGNABLE_BY: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: [Role.SUPER_ADMIN],
  [Role.ADMIN]: [Role.SUPER_ADMIN],
  [Role.MANAGER]: [Role.SUPER_ADMIN, Role.ADMIN],
  [Role.STAFF]: [Role.SUPER_ADMIN, Role.ADMIN],
};

/** 用户状态 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: '正常',
  [UserStatus.DISABLED]: '已停用',
};
