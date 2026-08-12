import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import {
  BatchUpdateSubmissionsDto,
  CreateSubmissionDto,
  FormPaginationQuery,
  Permission,
  UpdateSubmissionDto,
} from '@hgbord/shared';
import { CurrentUser, AuthUser, Public } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/jwt.guard';
import { PermissionsGuard } from '../../common/roles.guard';
import { RequirePermissions } from '../../common/decorators';
import { ZodValidationPipe } from '../../common/zod.pipe';
import { FormService } from './form.service';

/**
 * 表单管理 Controller
 *
 * 两类接口：
 * - 管理端（类级守卫 JwtAuthGuard + PermissionsGuard，需 FORM_MANAGE 权限）
 * - 公开端（方法级 @Public()，匿名访问，用于员工填报）
 *
 * 路由前缀 /api/forms（main.ts 设了全局 api 前缀）
 */
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('forms')
export class FormController {
  constructor(private readonly forms: FormService) {}

  // ═══════════════════════════════════════════════════════════
  // 管理端 —— 表单
  // ═══════════════════════════════════════════════════════════

  /** 表单列表 */
  @Get()
  @RequirePermissions(Permission.FORM_MANAGE)
  list(@Query(new ZodValidationPipe(FormPaginationQuery)) q: FormPaginationQuery) {
    return this.forms.list(q);
  }

  /** 单个表单详情（含 schema） */
  @Get(':id')
  @RequirePermissions(Permission.FORM_MANAGE)
  detail(@Param('id') id: string) {
    return this.forms.findById(id);
  }

  // ═══════════════════════════════════════════════════════════
  // 管理端 —— 提交记录
  // ═══════════════════════════════════════════════════════════

  /** 某表单的提交记录列表 */
  @Get(':id/submissions')
  @RequirePermissions(Permission.FORM_MANAGE)
  submissions(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(FormPaginationQuery)) q: FormPaginationQuery,
  ) {
    return this.forms.listSubmissions(id, q);
  }

  /** 修改一条提交记录 */
  @Patch(':id/submissions/:sid')
  @RequirePermissions(Permission.FORM_MANAGE)
  updateSubmission(
    @Param('id') _formId: string,
    @Param('sid') sid: string,
    @Body(new ZodValidationPipe(UpdateSubmissionDto)) dto: UpdateSubmissionDto,
  ) {
    return this.forms.updateSubmission(sid, dto);
  }

  /** 删除一条提交记录 */
  @Delete(':id/submissions/:sid')
  @RequirePermissions(Permission.FORM_MANAGE)
  deleteSubmission(@Param('id') _formId: string, @Param('sid') sid: string) {
    return this.forms.deleteSubmission(sid);
  }

  /** 批量保存（DataSheet 保存按钮） */
  @Post(':id/submissions/batch')
  @RequirePermissions(Permission.FORM_MANAGE)
  batchUpdate(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(BatchUpdateSubmissionsDto)) dto: BatchUpdateSubmissionsDto,
    @CurrentUser() _actor: AuthUser,
  ) {
    return this.forms.batchUpdate(id, dto);
  }

  // ═══════════════════════════════════════════════════════════
  // 公开端 —— 匿名填报（@Public 跳过 JWT）
  // ═══════════════════════════════════════════════════════════

  /** 公开查询表单（仅已发布）—— 给填报页用 */
  @Public()
  @Get('public/:id')
  publicDetail(@Param('id') id: string) {
    return this.forms.findPublicById(id);
  }

  /** 公开取最近提交记录（填报页显示「上次值」参考） */
  @Public()
  @Get('public/:id/submissions/recent')
  publicRecent(@Param('id') id: string) {
    return this.forms.listRecentSubmissions(id);
  }

  /** 公开提交记录列表（填报页显示表内最新值参考） */
  @Public()
  @Get('public/:id/submissions')
  publicSubmissions(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(FormPaginationQuery)) q: FormPaginationQuery,
  ) {
    return this.forms.listPublicSubmissions(id, q);
  }

  /** 公开提交（匿名，记录 IP） */
  @Public()
  @Post('public/:id/submit')
  publicSubmit(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateSubmissionDto)) dto: CreateSubmissionDto,
    @Req() req: Request,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      undefined;
    return this.forms.createSubmission(id, dto, ip);
  }
}
