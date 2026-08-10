'use client';
/**
 * SmartForm —— 表单填报组件（移动端优先）
 *
 * 设计参考 b2-source 的 SmartForm，但用 DESIGN.md 的视觉语言重写：
 * - 白底卡片 + Cal Sans 标题 + Inter 正文
 * - 字段按 schema.group 自动分步（基础/98%硫酸/发烟硫酸...）
 * - 每步只显示一组字段，底部「上一步 / 下一步 / 提交」
 * - bloom 聚焦（边框转墨色 + 阴影晕染）
 * - 移动端优先：max-w 居中，padding 紧凑，按钮 44px 高（触控标准）
 *
 * 数据流：父组件传入 schema + onSubmit，组件内部管理填写状态。
 */
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
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

/** 把字段按 group 聚合成步骤 */
interface Step {
  name: string;
  fields: FormField[];
}
function groupToSteps(schema: FormSchema): Step[] {
  const steps: Step[] = [];
  schema.forEach((f) => {
    const g = f.group ?? '其他';
    const last = steps[steps.length - 1];
    if (last && last.name === g) last.fields.push(f);
    else steps.push({ name: g, fields: [f] });
  });
  return steps.filter((s) => s.fields.some((f) => f.type !== 'text' || f.id === 'field_date'));
}

export function SmartForm({ title, description, schema, onSubmit, submitting }: SmartFormProps) {
  const steps = useMemo(() => groupToSteps(schema), [schema]);
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>(() => {
    // 默认值：日期字段填今天
    const init: Record<string, string> = {};
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    schema.forEach((f) => {
      if (f.type === 'date') init[f.id] = todayStr;
      else init[f.id] = '';
    });
    return init;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const current = steps[activeStep];
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;
  const progress = Math.round(((activeStep + 1) / steps.length) * 100);

  const setField = (id: string, val: string) => {
    setValues((prev) => ({ ...prev, [id]: val }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  /** 校验当前步的字段 */
  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    current.fields.forEach((f) => {
      const v = values[f.id];
      if (f.type === 'number') {
        if (v !== '' && Number.isNaN(Number(v))) errs[f.id] = '请输入数字';
      }
      if (f.type === 'date' && !v) errs[f.id] = '请选择日期';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep((i) => Math.min(i + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setActiveStep((i) => Math.max(i - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    // 组装数据：数字字段转 number，空值转 null
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
  };

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* 顶部进度条 */}
      <div className="sticky top-0 z-10 bg-surface-panel/80 backdrop-blur border-b border-hairline">
        <div className="max-w-[640px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-[12px] text-muted mb-1.5">
            <span className="font-medium text-ink">{title}</span>
            <span className="tnum">{activeStep + 1} / {steps.length}</span>
          </div>
          <div className="h-1 bg-surface-strong rounded-full overflow-hidden">
            <div
              className="h-full bg-ink rounded-full transition-all duration-200 ease-out-expo"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 主体 */}
      <div className="max-w-[640px] mx-auto px-4 py-6 pb-32">
        {/* 当前步标题 */}
        <div className="mb-5">
          <h2 className="font-display text-ink text-[22px] leading-[1.2]" style={{ letterSpacing: '-0.3px' }}>
            {current.name}
          </h2>
          {description && isFirst && (
            <p className="text-[13px] text-muted mt-1">{description}</p>
          )}
        </div>

        {/* 字段列表 */}
        <div className="bg-surface-panel border border-hairline rounded-lg p-4 space-y-4 shadow-lift">
          {current.fields.map((field) => (
            <FieldInput
              key={field.id}
              field={field}
              value={values[field.id] ?? ''}
              error={errors[field.id]}
              onChange={(v) => setField(field.id, v)}
            />
          ))}
        </div>
      </div>

      {/* 底部操作栏 —— 固定吸底 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-panel border-t border-hairline">
        <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center gap-2.5">
          {!isFirst && (
            <Button variant="outline" size="sm" onClick={handlePrev} className="h-11 px-4">
              <ChevronLeft className="w-4 h-4" />
              上一步
            </Button>
          )}
          <div className="flex-1" />
          {isLast ? (
            <Button onClick={handleSubmit} disabled={submitting} className="h-11 px-5 flex-1">
              <Check className="w-4 h-4" />
              {submitting ? '提交中…' : '提交'}
            </Button>
          ) : (
            <Button onClick={handleNext} className="h-11 px-5 flex-1">
              下一步
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 单个字段输入 —— 按类型渲染 */
function FieldInput({
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
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">
        {field.title}
        {field.unit && <span className="text-muted-soft font-normal ml-1">({field.unit})</span>}
      </label>
      {field.type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'bloom h-11 w-full px-3 text-[15px] text-ink bg-canvas border rounded-md',
            error ? 'border-danger' : 'border-hairline',
          )}
        >
          <option value="">— 请选择 —</option>
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
          placeholder={field.type === 'number' ? '输入数值' : ''}
          className={cn('h-11 text-[15px]', error && 'border-danger')}
        />
      )}
      {error && <p className="text-[12px] text-danger mt-1">{error}</p>}
    </div>
  );
}
