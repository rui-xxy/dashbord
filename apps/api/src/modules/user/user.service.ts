import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import {
  CreateUserDto,
  PaginationQuery,
  ROLE_ASSIGNABLE_BY,
  Role,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UserStatus,
} from '@hgbord/shared';
import { Errors } from '../../common/app-exception';
import type { AuthUser } from '../../common/decorators';
import { toUserVo } from './user.mapper';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  /** 列表（分页 + 搜索 + 筛选）—— 搜索匹配手机号或姓名 */
  async list(q: PaginationQuery) {
    const { page, pageSize, search, role, status } = q;
    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: items.map(toUserVo),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 取单个用户（用于守卫的 targetUser 预加载） */
  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /** 创建用户 */
  async create(dto: CreateUserDto, actor: AuthUser) {
    // 校验：actor 是否有权分配该角色（ADMIN 只能创建 MANAGER/STAFF）
    const assignableBy = ROLE_ASSIGNABLE_BY[dto.role] ?? [];
    if (!assignableBy.includes(actor.role)) {
      throw Errors.forbidden(`你无权分配 ${dto.role} 角色`);
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          name: dto.name,
          passwordHash,
          role: dto.role,
          status: UserStatus.ACTIVE,
        },
      });
      return toUserVo(user);
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2002') {
        throw Errors.conflict('该手机号已被注册');
      }
      throw e;
    }
  }

  /** 编辑资料（不含角色/状态） */
  async update(id: string, data: { name?: string; phone?: string; avatarUrl?: string | null }) {
    await this.getOrThrow(id);
    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return toUserVo(user);
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'P2002') {
        throw Errors.conflict('该手机号已被使用');
      }
      throw e;
    }
  }

  /** 修改角色（仅 SUPER_ADMIN） */
  async updateRole(id: string, dto: UpdateUserRoleDto, actor: AuthUser) {
    const target = await this.getOrThrow(id);

    // 校验：actor 是否有权分配新角色（ADMIN 不能提升到 ADMIN/SUPER_ADMIN）
    const assignableBy = ROLE_ASSIGNABLE_BY[dto.role] ?? [];
    if (!assignableBy.includes(actor.role)) {
      throw Errors.forbidden(`你无权分配 ${dto.role} 角色`);
    }

    // 规则1：目标若是 SUPER_ADMIN，不允许通过此接口降级（防误删超管）
    if (target.role === Role.SUPER_ADMIN && dto.role !== Role.SUPER_ADMIN) {
      const superCount = await this.prisma.user.count({ where: { role: Role.SUPER_ADMIN } });
      if (superCount <= 1) {
        throw Errors.badRequest('系统至少需保留 1 个超级管理员');
      }
    }
    // 规则2：不能把自己降级（避免误锁）
    if (id === actor.id && dto.role !== Role.SUPER_ADMIN) {
      throw Errors.badRequest('不能降低自己的角色');
    }
    const user = await this.prisma.user.update({ where: { id }, data: { role: dto.role } });
    return toUserVo(user);
  }

  /** 修改状态（停用/启用） */
  async updateStatus(id: string, dto: UpdateUserStatusDto, actor: AuthUser) {
    await this.getOrThrow(id);
    if (id === actor.id && dto.status === UserStatus.DISABLED) {
      throw Errors.badRequest('不能停用自己的账号');
    }
    const user = await this.prisma.user.update({ where: { id }, data: { status: dto.status } });
    return toUserVo(user);
  }

  /** 删除（仅 SUPER_ADMIN） */
  async remove(id: string, actor: AuthUser) {
    const target = await this.getOrThrow(id);
    if (target.role === Role.SUPER_ADMIN) {
      const superCount = await this.prisma.user.count({ where: { role: Role.SUPER_ADMIN } });
      if (superCount <= 1) {
        throw Errors.badRequest('系统至少需保留 1 个超级管理员，不可删除');
      }
    }
    if (id === actor.id) {
      throw Errors.badRequest('不能删除自己');
    }
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  private async getOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw Errors.notFound('用户不存在');
    return user;
  }
}
