'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { FormVo, FormSubmissionVo } from '@hgbord/shared';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { SmartForm } from '../smart-form';

/**
 * 表单填报页 —— /form-fill/:id
 *
 * 独立全屏路由（不在管理后台 (admin) 组里，无侧栏布局）。
 * 匿名访问：用公开接口 /forms/public/:id 拿 schema，
 * 提交走 /forms/public/:id/submit（不要求登录，记录 IP）。
 *
 * 移动端优先：SmartForm 自带手机适配。
 */
export default function FormFillPage() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<FormVo | null>(null);
  const [recent, setRecent] = useState<FormSubmissionVo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([api.forms.getPublic(params.id), api.forms.getRecent(params.id).catch(() => [])])
      .then(([f, r]) => {
        setForm(f);
        setRecent(r);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (data: Record<string, string | number | null>) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.forms.submitPublic(params.id, data);
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-soft text-muted">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <p className="text-[14px]">加载表单…</p>
      </div>
    );
  }

  // 错误
  if ((error && !form) || (!form && !loading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-soft p-6">
        <div className="bg-surface-panel border border-hairline rounded-lg p-8 text-center max-w-sm">
          <p className="text-[15px] text-ink font-semibold mb-1">表单加载失败</p>
          <p className="text-[13px] text-muted mb-4">{error ?? '未找到该表单'}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  // 提交成功
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-soft p-6">
        <div className="bg-surface-panel border border-hairline rounded-lg p-10 text-center max-w-sm shadow-lift">
          <div className="w-14 h-14 rounded-full bg-success-soft flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-success" />
          </div>
          <h2 className="font-display text-ink text-[20px] mb-1" style={{ letterSpacing: '-0.3px' }}>
            提交成功
          </h2>
          <p className="text-[13px] text-muted mb-6">感谢填写，数据已记录</p>
          <Button className="w-full h-11" onClick={() => window.location.reload()}>
            再填一份
          </Button>
        </div>
      </div>
    );
  }

  // 渲染表单
  return (
    <SmartForm
      title={form!.title}
      schema={form!.schema}
      recent={recent}
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
}
