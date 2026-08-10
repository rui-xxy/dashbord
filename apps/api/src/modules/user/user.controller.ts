import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  CreateUserDto,
  PaginationQuery,
  Permission,
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from '@hgbord/shared';
import {
  CurrentUser,
  AuthUser,
  RequirePermissions,
} from '../../common/decorators';
import { JwtAuthGuard } from '../../common/jwt.guard';
import { PermissionsGuard } from '../../common/roles.guard';
import { ZodValidationPipe } from '../../common/zod.pipe';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  /** 列表 —— 需要 USER_VIEW */
  @Get()
  @RequirePermissions(Permission.USER_VIEW)
  list(
    @Query(new ZodValidationPipe(PaginationQuery)) q: PaginationQuery,
    @CurrentUser() actor: AuthUser,
  ) {
    // 普通员工看不到用户列表（权限矩阵已挡），这里再保险一层
    return this.users.list(q);
  }

  /** 创建 —— 需要 USER_CREATE */
  @Post()
  @RequirePermissions(Permission.USER_CREATE)
  create(
    @Body(new ZodValidationPipe(CreateUserDto)) dto: CreateUserDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.users.create(dto, actor);
  }

  /** 编辑资料 —— 需要 USER_UPDATE */
  @Patch(':id')
  @RequirePermissions(Permission.USER_UPDATE)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserDto)) dto: UpdateUserDto,
  ) {
    return this.users.update(id, dto);
  }

  /** 修改角色 —— 仅 SUPER_ADMIN */
  @Patch(':id/role')
  @RequirePermissions(Permission.USER_UPDATE_ROLE)
  updateRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserRoleDto)) dto: UpdateUserRoleDto,
    @CurrentUser() actor: AuthUser,
    @Req() req: Request & { targetUser?: { role: string } },
  ) {
    return this.users.updateRole(id, dto, actor);
  }

  /** 停用/启用 */
  @Patch(':id/status')
  @RequirePermissions(Permission.USER_UPDATE_STATUS)
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserStatusDto)) dto: UpdateUserStatusDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.users.updateStatus(id, dto, actor);
  }

  /** 删除 —— 仅 SUPER_ADMIN */
  @Delete(':id')
  @RequirePermissions(Permission.USER_DELETE)
  remove(@Param('id') id: string, @CurrentUser() actor: AuthUser) {
    return this.users.remove(id, actor);
  }
}
