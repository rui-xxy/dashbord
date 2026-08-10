import { z } from 'zod';
import { Role, UserStatus } from './enums';

// ═══════════════════════════════════════════════════════════
// 手机号校验（中国大陆 11 位）
// ═══════════════════════════════════════════════════════════

/** 中国大陆手机号：1 开头，第二位 3-9，共 11 位 */
export const PHONE_REGEX = /^1[3-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, '请输入正确的手机号（11 位）');

// ═══════════════════════════════════════════════════════════
// 认证 DTO
// ═══════════════════════════════════════════════════════════

export const LoginDto = z.object({
  phone: phoneSchema,
  password: z.string().min(1, '请输入密码'),
});
export type LoginDto = z.infer<typeof LoginDto>;

export const TokenPair = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof TokenPair>;

// ═══════════════════════════════════════════════════════════
// 用户 DTO
// ═══════════════════════════════════════════════════════════

/** 对外的用户对象（永远不含 passwordHash） */
export const UserVo = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string(),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(UserStatus),
  avatarUrl: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserVo = z.infer<typeof UserVo>;

export const CreateUserDto = z.object({
  phone: phoneSchema,
  name: z.string().min(2, '姓名至少 2 个字符').max(20, '姓名最多 20 个字符'),
  password: z.string().min(6, '密码至少 6 位').max(72, '密码最多 72 位'),
  role: z.nativeEnum(Role).default(Role.STAFF),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = z.object({
  name: z.string().min(2).max(20).optional(),
  phone: phoneSchema.optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const UpdateUserRoleDto = z.object({
  role: z.nativeEnum(Role),
});
export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleDto>;

export const UpdateUserStatusDto = z.object({
  status: z.nativeEnum(UserStatus),
});
export type UpdateUserStatusDto = z.infer<typeof UpdateUserStatusDto>;

// ═══════════════════════════════════════════════════════════
// 分页
// ═══════════════════════════════════════════════════════════

export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;

export const Paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

export const PaginatedUserVo = Paginated(UserVo);
export type PaginatedUserVo = z.infer<typeof PaginatedUserVo>;
