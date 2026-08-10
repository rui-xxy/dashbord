'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataSheet } from '../components/data-sheet';
import { api } from '@/lib/api';
import type { FormSubmissionVo } from '@hgbord/shared';

/**
 * 表单数据页 —— /forms/[id]
 *
 * 标题区（返回 + 表单名 + 预览按钮）
 * + 白底内容卡内嵌 DataSheet
 * 数据来自真实 API：GET /api/forms/:id + GET /api/forms/:id/submissions
 */
export default function FormDataPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ['forms', id],
    queryFn: () => api.forms.getById(id),
    enabled: !!id,
  });

  const { data: subsData } = useQuery({
    queryKey: ['forms', id, 'submissions'],
    queryFn: () => api.forms.listSubmissions(id, { pageSize: 100 }),
    enabled: !!id,
  });

  if (!formLoading && !form) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-muted">未找到该表单</p>
        <Button variant="outline" asChild>
          <Link href="/forms">返回表单列表</Link>
        </Button>
      </div>
    );
  }

  // FormSubmissionVo → DataSheet 需要的格式
  const submissions: FormSubmissionVo[] = subsData?.items ?? [];

  return (
    <div>
      {/* 标题区 —— display-sm */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-2">
            <Link href="/forms">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1
            className="font-display text-ink text-[24px] leading-[1.2] truncate"
            style={{ letterSpacing: '-0.5px' }}
          >
            {form?.title ?? '加载中…'}
          </h1>
        </div>
        <Button variant="outline" className="shrink-0">
          <Eye className="w-4 h-4" />
          预览表单
        </Button>
      </div>

      {/* 内容卡 —— 与列表页同款：白底 + hairline + lift 阴影 */}
      <div className="bg-surface-panel border border-hairline rounded-lg shadow-lift overflow-hidden">
        {form && (
          <DataSheet
            formId={form.id}
            schema={form.schema}
            submissions={submissions.map((s) => ({ id: s.id, data: s.data, createdAt: s.createdAt }))}
          />
        )}
      </div>
    </div>
  );
}
