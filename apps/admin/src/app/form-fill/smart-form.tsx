'use client';
/**
 * SmartForm —— 表单填报组件（对齐 b2-source 原版 + 修原版 bug）
 *
 * 设计要点（基于源码逐行核对 + 用户确认的 3 个决策）：
 * 1. 按 group 分页（等价原版 schema.pages）
 * 2. hidden:true 的字段不渲染（修原版 bug，field_date 自动填今天）
 * 3. 显示 suffix 单位后缀（改进，比原版清晰：储罐显示 %、仪表显示 千瓦时）
 * 4. 显示 description 字段说明（原版行为：物料: 98酸 / 类型: 电表）
 * 5. 单列纵向堆叠 + 居中卡片（maxWidth 720）+ 进度条
 * 6. 底部按钮 flex space-between（上一页/下一页/提交）
 *
 * 视觉用 DESIGN.md 语言；布局/交互严格照原版。
 */
import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';
import type { FormSchema, FormField } from '@hgbord/shared';

interface SmartFormProps {
  title: string;
  description?: string | null;
  schema: FormSchema;
  onSubmit: (data: Record<string, string | number | null>) => Promise<void>;
  submitting?: boolean;
}

/** 把扁平 schema 按 group 聚合成页 */
interface Page {
  title: string;
  fields: FormField[];
}
function groupToPages(schema: FormSchema): Page[] {
  const pages: Page[] = [];
  schema.forEach((f) => {
    const g = f.group ?? '其他';
    const last = pages[pages.length - 1];
    if (last && last.title === g) last.fields.push(f);
    else pages.push({ title: g, fields: [f] });
  });
  return pages;
}

/** 今天的日期 YYYY-MM-DD */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function SmartForm({ title, description, schema, onSubmit, submitting }: SmartFormProps) {
  const pages = useMemo(() => groupToPages(schema), [schema]);
  const hasMultiplePages = pages.length > 1;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    schema.forEach((f) => {
      init[f.id] = '';
    });
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentPage = pages[currentPageIndex];
  // 当前页可见字段（过滤掉 hidden）
  const visibleFields = currentPage.fields.filter((f) => !f.hidden);
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === pages.length - 1;
  const progress = hasMultiplePages ? Math.round(((currentPageIndex + 1) / pages.length) * 100) : 0;

  const handleChange = (id: string, val: string) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    if (errors[id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  /** 校验当前页（仅必填，不校验隐藏字段） */
  const validateCurrentPage = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const f of visibleFields) {
      if (f.required) {
        const v = values[f.id];
        if (v === undefined || v === null || v === '') {
          newErrors[f.id] = `${f.title}不能为空`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentPage()) return;
    setCurrentPageIndex((i) => Math.min(i + 1, pages.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentPageIndex((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateCurrentPage()) return;
    // 组装数据：hidden 的 date 字段自动填今天；number 空→null 非空→Number
    const data: Record<string, string | number | null> = {};
    schema.forEach((f) => {
      if (f.hidden) {
        // 隐藏字段（field_date）自动填今天
        if (f.type === 'date') data[f.id] = todayStr();
        return;
      }
      const v = values[f.id];
      if (f.type === 'number') {
        data[f.id] = v === '' ? null : Number(v);
      } else {
        data[f.id] = v;
      }
    });
    await onSubmit(data);
    setSubmitted(true);
  };

  // 提交成功页
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-card" style={{ padding: 24 }}>
        <div className="bg-surface-panel border border-hairline rounded-lg text-center max-w-[480px] w-full shadow-raised" style={{ padding: 48 }}>
          <div className="w-16 h-16 rounded-full bg-success-soft flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="font-display text-ink text-[24px] mb-2" style={{ letterSpacing: '-0.3px' }}>
            提交成功！
          </h2>
          <p className="text-[14px] text-muted mb-6">感谢您的填写，您的反馈对我们非常重要。</p>
          <Button className="w-full h-11" onClick={() => window.location.reload()}>
            再填一份
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-form min-h-screen bg-surface-card" style={{ padding: '24px 16px' }}>
      {/* 居中卡片 —— maxWidth 720, 圆角 12, 阴影 */}
      <div className="smart-form-card bg-surface-panel mx-auto rounded-lg shadow-raised" style={{ maxWidth: 720, borderRadius: 12 }}>
        <div style={{ padding: 32 }}>
          {/* 标题区 —— 居中 */}
          <div className="text-center mb-8">
            <h1 className="font-display text-ink text-[22px] mb-2" style={{ letterSpacing: '-0.3px' }}>
              {title}
            </h1>
            {description && <p className="text-[14px] text-muted">{description}</p>}
          </div>

          {/* 进度条 —— 仅多页时 */}
          {hasMultiplePages && (
            <div className="mb-6">
              <div className="h-1 bg-surface-strong rounded-full overflow-hidden">
                <div
                  className="h-full bg-ink rounded-full transition-all duration-200 ease-out-expo"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center mt-2">
                <span className="text-[12px] text-muted">
                  第 {currentPageIndex + 1} 页，共 {pages.length} 页
                </span>
              </div>
            </div>
          )}

          {/* 页标题 + 虚线分隔 */}
          <div className="mb-6 pb-4" style={{ borderBottom: '1px dashed #e5e7eb' }}>
            <h2 className="font-display text-ink text-[16px]">{currentPage.title}</h2>
          </div>

          {/* 字段列表 —— 单列纵向堆叠 */}
          <div className="space-y-6">
            {visibleFields.map((field) => (
              <FieldItem
                key={field.id}
                field={field}
                value={values[field.id] ?? ''}
                error={errors[field.id]}
                onChange={(v) => handleChange(field.id, v)}
              />
            ))}
          </div>

          {/* 操作按钮 —— flex space-between */}
          <div className="mt-8 flex justify-between items-center gap-3">
            {hasMultiplePages ? (
              <>
                <Button
                  variant="outline"
                  className="smart-form-btn h-11 px-5"
                  disabled={isFirstPage}
                  onClick={handlePrev}
                >
                  上一页
                </Button>
                {isLastPage ? (
                  <Button className="smart-form-btn h-11 px-6" disabled={submitting} onClick={handleSubmit}>
                    {submitting ? '提交中…' : '提交'}
                  </Button>
                ) : (
                  <Button className="smart-form-btn h-11 px-6" onClick={handleNext}>
                    下一页
                  </Button>
                )}
              </>
            ) : (
              <Button className="smart-form-btn h-11 px-6 w-full" disabled={submitting} onClick={handleSubmit}>
                {submitting ? '提交中…' : '提交'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 移动端适配 —— 对齐原版 @media (max-width:768px) */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .smart-form { padding: 16px 12px !important; }
          .smart-form-card { border-radius: 8px !important; }
          .smart-form-btn { height: 44px !important; font-size: 15px !important; }
        }
      `}</style>
    </div>
  );
}

/** 单个字段 —— label + 必填星号 + 输入框(带 suffix) + description 灰字 + error */
function FieldItem({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const required = !!field.required;
  const hasSuffix = !!field.suffix;

  return (
    <div>
      {/* label + 必填星号 */}
      <label className="block text-[14px] font-medium text-ink mb-1.5">
        {field.title}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      {/* 输入框 —— 数字字段带 suffix 单位后缀 */}
      {field.type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'bloom h-11 w-full px-3.5 text-[14px] text-ink bg-canvas border rounded-md',
            error ? 'border-danger' : 'border-hairline',
          )}
        >
          <option value="">请选择</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : hasSuffix ? (
        // 带 suffix 的数字输入框 —— 用相对定位把单位放右侧
        <div className="relative">
          <Input
            type="text"
            inputMode={field.type === 'number' ? 'decimal' : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? (field.type === 'number' ? '请输入数值' : '')}
            className={cn('h-11 text-[14px] pr-14', error && 'border-danger')}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-muted-soft pointer-events-none">
            {field.suffix}
          </span>
        </div>
      ) : (
        <Input
          type={field.type === 'date' ? 'date' : 'text'}
          inputMode={field.type === 'number' ? 'decimal' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ''}
          className={cn('h-11 text-[14px]', error && 'border-danger')}
        />
      )}

      {/* description 灰字（输入框下方）+ error 红字（优先） */}
      {error ? (
        <p className="text-[12px] text-danger mt-1">{error}</p>
      ) : field.description ? (
        <p className="text-[12px] text-muted-soft mt-1">{field.description}</p>
      ) : null}
    </div>
  );
}
