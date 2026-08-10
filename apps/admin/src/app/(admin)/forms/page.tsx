'use client';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { Permission } from '@hgbord/shared';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { MOCK_FORMS, type FormVo } from '@/lib/forms-data';

/**
 * 表单管理 —— 我创建好的表单列表
 *
 * 视觉与 users/page.tsx 同一套：白底内容卡（hairline + lift 阴影）+ 表格 + 行 hover wash。
 * 后端尚未实现，数据来自 lib/forms-data.ts 的原型数据。
 */
export default function FormsPage() {
  const { can } = useAuth();

  return (
    <div>
      {/* 标题 + 操作 —— display-sm: Cal Sans 28px / 600 / -0.5px */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-ink text-[28px] leading-[1.2]" style={{ letterSpacing: '-0.5px' }}>
            表单管理
          </h1>
          <p className="text-[14px] text-muted mt-1.5">
            共 <span className="tnum text-ink font-medium">{MOCK_FORMS.length}</span> 个表单
          </p>
        </div>
        {can(Permission.FORM_MANAGE) && (
          <Button>
            <Plus className="w-4 h-4" />
            新建表单
          </Button>
        )}
      </div>

      {/* 内容卡 —— 与 users 页同一套：白底 + hairline + lift 阴影 */}
      <div className="bg-surface-panel border border-hairline rounded-lg shadow-lift overflow-hidden">
        {/* 表格 */}
        <table className="w-full">
          <thead>
            <tr className="bg-surface-inset h-12 text-[12px] font-semibold uppercase tracking-wider text-muted-soft">
              <th className="text-left px-6">表单名称</th>
              <th className="text-right px-4">收集份数</th>
              <th className="text-right px-4">更新时间</th>
              <th className="text-right px-6 w-32">操作</th>
            </tr>
          </thead>
          <tbody className="text-[14px]">
            {MOCK_FORMS.map((form) => (
              <FormRow key={form.id} form={form} />
            ))}
          </tbody>
        </table>

        {/* 底部计数条 */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-hairline-soft text-[14px]">
          <span className="text-muted tnum">
            共 <span className="text-ink font-medium">{MOCK_FORMS.length}</span> 个表单
          </span>
        </div>
      </div>
    </div>
  );
}

/** 表单行 —— 名称 + 收集份数 + 更新时间 + 数据/预览 两个按钮 */
function FormRow({ form }: { form: FormVo }) {
  return (
    <tr className="row-wash border-t border-hairline-soft h-16">
      {/* 表单名称 —— 图标 + 标题 + 描述 */}
      <td className="px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-surface-soft border border-hairline flex items-center justify-center shrink-0">
            <FileText className="w-[18px] h-[18px] text-ink" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink">{form.title}</div>
            {form.description && (
              <div className="text-[12px] text-muted-soft truncate">{form.description}</div>
            )}
          </div>
        </div>
      </td>

      {/* 收集份数 */}
      <td className="px-4 text-right tnum font-medium text-ink">
        {form.collected.toLocaleString('zh-CN')}
      </td>

      {/* 更新时间 */}
      <td className="px-4 text-right tnum text-muted">{formatDate(form.updatedAt)}</td>

      {/* 操作：数据 · 预览 */}
      <td className="px-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/forms/${form.id}`}>数据</Link>
          </Button>
          <Button variant="ghost" size="sm">
            预览
          </Button>
        </div>
      </td>
    </tr>
  );
}

/** 相对时间格式化 */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date('2026-08-11T12:00:00.000Z');
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - d.getTime()) / dayMs);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diffDays === 0) return `今天 ${time}`;
  if (diffDays === 1) return `昨天 ${time}`;
  if (diffDays === 2) return `前天 ${time}`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return d.toLocaleDateString('zh-CN');
}
