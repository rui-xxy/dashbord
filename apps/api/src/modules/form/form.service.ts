import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import type {
  BatchUpdateSubmissionsDto,
  CreateSubmissionDto,
  FormPaginationQuery,
  SubmissionData,
  UpdateSubmissionDto,
} from '@hgbord/shared';
import { Errors } from '../../common/app-exception';
import { toFormVo, toSubmissionVo } from './form.mapper';

@Injectable()
export class FormService {
  constructor(private readonly prisma: PrismaClient) {}

  // ═══════════════════════════════════════════════════════════
  // Form CRUD（管理端）
  // ═══════════════════════════════════════════════════════════

  /** 表单列表（带每表 collected 计数） */
  async list(q: FormPaginationQuery) {
    const { page, pageSize, search } = q;
    const where: Prisma.FormWhereInput = search
      ? { title: { contains: search, mode: 'insensitive' } }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.form.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { _count: { select: { submissions: true } } },
      }),
      this.prisma.form.count({ where }),
    ]);
    return {
      items: items.map(toFormVo),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 单个表单（含 schema） */
  async findById(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: { _count: { select: { submissions: true } } },
    });
    if (!form) throw Errors.notFound('表单不存在');
    return toFormVo(form);
  }

  /** 公开查询（仅已发布） */
  async findPublicById(id: string) {
    const form = await this.prisma.form.findFirst({
      where: { id, status: 'published' },
      include: { _count: { select: { submissions: true } } },
    });
    if (!form) throw Errors.notFound('表单不存在或未发布');
    return toFormVo(form);
  }

  // ═══════════════════════════════════════════════════════════
  // Submission 查询（管理端 + 公开端都用）
  // ═══════════════════════════════════════════════════════════

  /** 某表单的提交记录分页（按时间倒序，便于看最新数据） */
  async listSubmissions(formId: string, q: FormPaginationQuery) {
    await this.getFormOrThrow(formId);
    const { page, pageSize } = q;
    const where: Prisma.FormSubmissionWhereInput = { formId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.formSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.formSubmission.count({ where }),
    ]);
    return {
      items: items.map(toSubmissionVo),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 提交 / 编辑 / 删除
  // ═══════════════════════════════════════════════════════════

  /** 公开提交（匿名，记录 IP） */
  async createSubmission(formId: string, dto: CreateSubmissionDto, ip?: string) {
    await this.getFormOrThrow(formId);
    const sub = await this.prisma.formSubmission.create({
      data: { formId, data: dto.data as Prisma.InputJsonValue, submitterIp: ip ?? null },
    });
    return toSubmissionVo(sub);
  }

  /** 修改一条提交记录 */
  async updateSubmission(id: string, dto: UpdateSubmissionDto) {
    const existing = await this.prisma.formSubmission.findUnique({ where: { id } });
    if (!existing) throw Errors.notFound('记录不存在');
    const sub = await this.prisma.formSubmission.update({
      where: { id },
      data: { data: dto.data as Prisma.InputJsonValue },
    });
    return toSubmissionVo(sub);
  }

  /** 删除一条提交记录 */
  async deleteSubmission(id: string) {
    const existing = await this.prisma.formSubmission.findUnique({ where: { id } });
    if (!existing) throw Errors.notFound('记录不存在');
    await this.prisma.formSubmission.delete({ where: { id } });
    return { success: true as const };
  }

  /**
   * 批量保存（DataSheet 保存按钮用）
   * 一次请求完成 created / updated / deleted 三类变更
   */
  async batchUpdate(formId: string, dto: BatchUpdateSubmissionsDto) {
    await this.getFormOrThrow(formId);

    const created = dto.created ?? [];
    const updated = dto.updated ?? [];
    const deleted = dto.deleted ?? [];

    await this.prisma.$transaction(async (tx) => {
      // 新增
      if (created.length > 0) {
        await tx.formSubmission.createMany({
          data: created.map((c) => ({
            formId,
            data: c.data as Prisma.InputJsonValue,
          })),
        });
      }
      // 修改（逐条，因为 data 各异）
      for (const u of updated) {
        await tx.formSubmission.updateMany({
          where: { id: u.id, formId }, // formId 约束防止跨表单越权改
          data: { data: u.data as Prisma.InputJsonValue },
        });
      }
      // 删除（约束 formId）
      if (deleted.length > 0) {
        await tx.formSubmission.deleteMany({
          where: { id: { in: deleted }, formId },
        });
      }
    });

    return {
      success: true as const,
      created: created.length,
      updated: updated.length,
      deleted: deleted.length,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // 工具
  // ═══════════════════════════════════════════════════════════

  private async getFormOrThrow(id: string) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) throw Errors.notFound('表单不存在');
    return form;
  }
}
