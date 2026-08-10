'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataSheet } from '../components/data-sheet';
import { getFormById, MOCK_SUBMISSIONS, formatDate } from '@/lib/forms-data';

/**
 * 表单数据页 —— /forms/[id]
 *
 * 标题区（返回 + 表单名 + 副标题 + 预览按钮）
 * + 白底内容卡内嵌 DataSheet
 */
export default function FormDataPage() {
  const params = useParams<{ id: string }>();
  const form = getFormById(params.id);

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-muted">未找到该表单</p>
        <Button variant="outline" asChild>
          <Link href="/forms">返回表单列表</Link>
        </Button>
      </div>
    );
  }

  const submissions = MOCK_SUBMISSIONS[form.id] ?? [];

  return (
    <div>
      {/* 标题区 —— display-sm */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2">
            <Link href="/forms">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1
              className="font-display text-ink text-[24px] leading-[1.2] truncate"
              style={{ letterSpacing: '-0.5px' }}
            >
              {form.title}
            </h1>
            {form.description && (
              <p className="text-[14px] text-muted mt-1.5 leading-relaxed">{form.description}</p>
            )}
            <p className="text-[12px] text-muted-soft mt-1 tnum">
              {form.schema.length} 个字段 · 共 {submissions.length} 条数据 · 更新于 {formatDate(form.updatedAt)}
            </p>
          </div>
        </div>
        <Button variant="outline" className="shrink-0">
          <Eye className="w-4 h-4" />
          预览表单
        </Button>
      </div>

      {/* 内容卡 —— 与列表页同款：白底 + hairline + lift 阴影 */}
      <div className="bg-surface-panel border border-hairline rounded-lg shadow-lift overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-hairline-soft">
          <h2 className="text-[14px] font-semibold text-ink">数据收集</h2>
          <span className="text-[12px] text-muted-soft">点击单元格编辑 · 方向键导航</span>
        </div>
        <DataSheet schema={form.schema} submissions={submissions} />
      </div>
    </div>
  );
}
