import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@hgbord/shared';
import { Errors } from '../../common/app-exception';
import type { AuthUser } from '../../common/decorators';
import { toUserVo } from '../user/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwt: JwtService,
  ) {}

  /** 登录 —— 校验手机号密码 + 状态，签发双 token */
  async login(phone: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw Errors.unauthorized('手机号或密码错误');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw Errors.unauthorized('手机号或密码错误');

    if (user.status !== UserStatus.ACTIVE) {
      throw Errors.forbidden('账号已被停用，请联系管理员');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(user.id, user.phone, user.name, user.role as Role);
  }

  /** 刷新 access token */
  async refresh(refreshToken: string) {
    if (!refreshToken) throw Errors.unauthorized('缺少 refresh token');
    try {
      const payload = await this.jwt.verifyAsync<{ user: AuthUser; type: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (payload.type !== 'refresh') throw new Error();
      const user = await this.prisma.user.findUnique({ where: { id: payload.user.id } });
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw Errors.forbidden('账号不可用');
      }
      return this.issueTokens(user.id, user.phone, user.name, user.role as Role);
    } catch {
      throw Errors.unauthorized('refresh token 无效或已过期，请重新登录');
    }
  }

  /** 当前用户 */
  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw Errors.notFound('用户不存在');
    return toUserVo(user);
  }

  /** 登出 —— 原型阶段：前端清掉 token 即可。预留拉黑接口。 */
  async logout(_refreshToken?: string) {
    // TODO: 接入 Redis 后把 refreshToken jti 加入黑名单
    return { success: true };
  }

  // ──────────────────────────────────────────────
  private async issueTokens(id: string, phone: string, name: string, role: Role) {
    const user: AuthUser = { id, phone, name, role, status: UserStatus.ACTIVE };
    const accessToken = await this.jwt.signAsync(
      { user, type: 'access' },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { user, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
      },
    );
    return { accessToken, refreshToken, user: { ...user, status: UserStatus.ACTIVE } };
  }
}
