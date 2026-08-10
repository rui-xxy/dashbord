import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { LoginDto } from '@hgbord/shared';
import { Public, CurrentUser, AuthUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/jwt.guard';
import { ZodValidationPipe } from '../../common/zod.pipe';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** 登录 */
  @Public()
  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginDto)) dto: LoginDto) {
    return this.auth.login(dto.phone, dto.password);
  }

  /** 刷新 token */
  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.auth.refresh(refreshToken);
  }

  /** 当前用户信息 */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  /** 登出（拉黑 refresh token） */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string | undefined) {
    return this.auth.logout(refreshToken);
  }
}
