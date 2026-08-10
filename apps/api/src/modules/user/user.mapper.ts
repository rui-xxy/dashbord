import type { User as DbUser } from '@prisma/client';
import { Role, UserStatus, type UserVo } from '@hgbord/shared';

/** Prisma User → 对外 UserVo（永远不含 passwordHash） */
export function toUserVo(u: DbUser): UserVo {
  return {
    id: u.id,
    phone: u.phone,
    name: u.name,
    role: u.role as Role,
    status: u.status as UserStatus,
    avatarUrl: u.avatarUrl,
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  };
}
