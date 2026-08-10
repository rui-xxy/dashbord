'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Permission } from '@hgbord/shared';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/forms-data';

/**
 * 表单管理 —— 列表页
 *
 * 数据来自真实 API：GET /api/forms
 */
export default function FormsPage() {
  const { can } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: () => api.forms.list({ pageSize: 50 }),
  });
  const forms = data?.items ?? [];

  return (
    <div>
      {/* 标题 + 操作 —— display-sm: Cal Sans 28px / 600 / -0.5px */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-ink text-[28px] leading-[1.2]" style={{ letterSpacing: '-0.5px' }}>
          表单管理
        </h1>
        {can(Permission.FORM_MANAGE) && (
          <Button>
            <Plus className="w-4 h-4" />
            新建表单
          </Button>
        )}
      </div>

      {/* 内容卡 —— 与 users 页同一套：白底 + hairline + lift 阴影 */}
      <div className="bg-surface-panel border border-hairline rounded-lg shadow-lift overflow-hidden">
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
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-16">
                  加载中…
                </td>
              </tr>
            )}
            {!isLoading && forms.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-16">
                  暂无表单
                </td>
              </tr>
            )}
            {forms.map((form) => (
              <tr key={form.id} className="row-wash border-t border-hairline-soft h-16">
                <td className="px-6 font-semibold text-ink">{form.title}</td>
                <td className="px-4 text-right tnum font-medium text-ink">
                  {form.collected.toLocaleString('zh-CN')}
                </td>
                <td className="px-4 text-right tnum text-muted">{formatDate(form.updatedAt)}</td>
                <td className="px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/forms/${form.id}`}>数据</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/form-fill/${form.id}`} target="_blank" rel="noreferrer">
                        预览
                      </a>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
