'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataSheet } from '../components/data-sheet';
import { getFormById, MOCK_SUBMISSIONS } from '@/lib/forms-data';

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
            {form.title}
          </h1>
        </div>
        <Button variant="outline" className="shrink-0">
          <Eye className="w-4 h-4" />
          预览表单
        </Button>
      </div>

      {/* 内容卡 —— 与列表页同款：白底 + hairline + lift 阴影 */}
      <div className="bg-surface-panel border border-hairline rounded-lg shadow-lift overflow-hidden">
        <DataSheet schema={form.schema} submissions={submissions} />
      </div>
    </div>
  );
}
