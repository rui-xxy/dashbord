import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { TargetUserGuard } from '../../common/target-user.guard';
import { ZodValidationPipe } from '../../common/zod.pipe';
import { UserService } from './user.service';

/**
 * 守卫链顺序：JWT 鉴权 → 目标用户预加载 → 权限（含严格层级判断）
 * TargetUserGuard 把 :id 对应的用户挂到 req.targetUser，PermissionsGuard
 * 据此执行「只能动比自己级别低的人，同级/上级一律 403」。
 */
@UseGuards(JwtAuthGuard, TargetUserGuard, PermissionsGuard)
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
