'use client';
/**
 * SmartForm —— 表单填报组件（1:1 对齐 b2-source 原版设计）
 *
 * 原版行为（apps/client/src/components/SmartForm/index.tsx）：
 * - 按 schema.pages 分页（这里按 group 分页，等价）
 * - 标题居中 + 描述
 * - 进度条 + "第 X 页，共 N 页"（仅多页时）
 * - 页标题 h5 + 虚线下边框 + page.description
 * - 字段单列纵向堆叠，label + 红色必填星号 + help(description 小字)
 * - 数字字段不显示 suffix/unit（原版不渲染）
 * - 日期不默认填今天（原版无默认值）
 * - 底部按钮 flex space-between：上一页 / 下一页 / 提交
 * - 校验仅必填，只校验当前页
 * - 移动端 @media 调 padding/圆角/按钮高度
 * - 提交后绿色对勾 + "再填一份"
 *
 * 视觉用 DESIGN.md 语言（白底卡片 + Cal Sans 标题 + bloom 聚焦），
 * 但布局结构、交互逻辑、字段呈现严格照原版。
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

/** 把扁平 schema 按 group 聚合成页（等价于原版的 schema.pages） */
interface Page {
  title: string;
  description?: string;
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

export function SmartForm({ title, description, schema, onSubmit, submitting }: SmartFormProps) {
  const pages = useMemo(() => groupToPages(schema), [schema]);
  const hasMultiplePages = pages.length > 1;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // formData：所有字段值的字典（原版用 Record<string, unknown>，这里用 string 简化）
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    schema.forEach((f) => {
      init[f.id] = '';
    });
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentPage = pages[currentPageIndex];
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

  /** 校验当前页（仅必填）—— 对齐原版 validateCurrentPage */
  const validateCurrentPage = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const f of currentPage.fields) {
      // 必填字段：field_date 必填（其他字段原版默认非必填）
      if (f.id === 'field_date') {
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
    // 组装数据：数字字段转 number，空值转 null（对齐原版的 Record<string,unknown>）
    const data: Record<string, string | number | null> = {};
    schema.forEach((f) => {
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

  // 提交成功页 —— 绿色对勾 + "再填一份"
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft" style={{ padding: 24 }}>
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
    <div
      className="smart-form min-h-screen"
      style={{ background: '#f5f5f5', padding: '24px 16px' }}
    >
      {/* 居中卡片 —— 原版 maxWidth 720, borderRadius 12, boxShadow */}
      <div className="smart-form-card bg-surface-panel mx-auto rounded-lg shadow-raised" style={{ maxWidth: 720, borderRadius: 12 }}>
        <div style={{ padding: 32 }}>
          {/* 表单标题 —— 居中 */}
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

          {/* 页标题 —— h5 + 虚线下边框 */}
          {hasMultiplePages && (
            <div className="mb-6 pb-4" style={{ borderBottom: '1px dashed #e5e7eb' }}>
              <h2 className="font-display text-ink text-[16px] mb-1">{currentPage.title}</h2>
            </div>
          )}

          {/* 字段列表 —— 单列纵向堆叠 */}
          <div className="space-y-6">
            {currentPage.fields.map((field) => (
              <FieldItem
                key={field.id}
                field={field}
                value={values[field.id] ?? ''}
                error={errors[field.id]}
                onChange={(v) => handleChange(field.id, v)}
              />
            ))}
          </div>

          {/* 操作按钮 —— flex space-between（原版布局） */}
          <div className="mt-8 flex justify-between items-center">
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
                  <Button
                    className="smart-form-btn h-11 px-6"
                    disabled={submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? '提交中…' : '提交'}
                  </Button>
                ) : (
                  <Button className="smart-form-btn h-11 px-6" onClick={handleNext}>
                    下一页
                  </Button>
                )}
              </>
            ) : (
              <Button
                className="smart-form-btn h-11 px-6 w-full"
                disabled={submitting}
                onClick={handleSubmit}
              >
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

/** 单个字段 —— label + 必填星号 + 输入控件 + help(description) + error */
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
  // 必填标记（field_date 必填，其余按原版默认非必填）
  const required = field.id === 'field_date';

  return (
    <div>
      {/* label */}
      <label className="block text-[14px] font-medium text-ink mb-1.5">
        {field.title}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      {/* 输入控件 —— 数字字段不显示 suffix/unit（原版不渲染） */}
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
      ) : (
        <Input
          type={field.type === 'date' ? 'date' : 'text'}
          inputMode={field.type === 'number' ? 'decimal' : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === 'date' ? '请选择日期' : field.type === 'number' ? '请输入数值' : ''}
          className={cn('h-11 text-[14px]', error && 'border-danger')}
        />
      )}

      {/* help —— description 小字（原版的 Form.Item help） */}
      {/* error 优先于 description 显示 */}
      {error ? (
        <p className="text-[12px] text-danger mt-1">{error}</p>
      ) : null}
    </div>
  );
}
