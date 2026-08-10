'use client';
/**
 * SmartForm —— 三段式填报表单（对齐 b2-source admin 端 /form-fill/:id）
 *
 * 核心设计（完全不同于分步向导）：
 * - 100vh 固定布局，类似手机 App
 * - 顶部：标题 + 今天日期（固定）
 * - Tabs：按 group 分标签（储罐液位 / 仪表读数 / 停车记录），可横滑切换
 * - 内容区独立滚动：每行是「字段名 | 上次值 | 输入框」三段式
 * - 底部吸底提交按钮：实时显示进度「确认并提交 (12/19)」
 *
 * 字段过滤：hidden:true 的字段（field_date）不渲染，提交时自动填今天。
 * 上次值：从 getRecent 拉历史提交，每个字段显示最近一次有值的 数据 + 日期。
 */
import { useEffect, useMemo, useState } from 'react';
import { AppWindow, Zap, Car, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { FormSchema, FormField, FormSubmissionVo } from '@hgbord/shared';

interface SmartFormProps {
  title: string;
  schema: FormSchema;
  recent: FormSubmissionVo[]; // 最近提交记录（用于显示「上次值」）
  onSubmit: (data: Record<string, string | number | null>) => Promise<void>;
  submitting?: boolean;
}

/** 把扁平 schema 按 group 聚合成 Tab 页 */
interface TabPage {
  id: string;
  title: string;
  icon: 'tank' | 'meter' | 'parking';
  fields: FormField[];
}
function groupToTabs(schema: FormSchema): TabPage[] {
  const tabs: TabPage[] = [];
  schema.forEach((f) => {
    const g = f.group ?? '其他';
    // 跳过隐藏字段（field_date），它不参与渲染
    if (f.hidden) return;
    const icon: TabPage['icon'] = g === '仪表读数' ? 'meter' : 'tank';
    const last = tabs[tabs.length - 1];
    if (last && last.title === g) last.fields.push(f);
    else tabs.push({ id: g, title: g, icon, fields: [f] });
  });
  // 停车记录固定加最后
  tabs.push({ id: 'parking', title: '停车记录', icon: 'parking', fields: [] });
  return tabs;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayDisplay(): string {
  return new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
}

/** 从最近提交里，为每个字段找到最近一次有值的（数据 + 日期） */
function buildLastValues(recent: FormSubmissionVo[]): Record<string, { value: string | number | null; date: string }> {
  const map: Record<string, { value: string | number | null; date: string }> = {};
  // recent 已按 createdAt desc 排序，取每个字段第一条有值的
  const allFields = new Set<string>();
  recent.forEach((s) => Object.keys(s.data).forEach((k) => allFields.add(k)));
  for (const fid of allFields) {
    for (const s of recent) {
      const v = s.data[fid];
      if (v !== undefined && v !== null && v !== '') {
        // 优先用 field_date 字段的值作为业务日期，否则用 createdAt
        const businessDate = (s.data.field_date as string) || s.createdAt;
        map[fid] = { value: v, date: businessDate };
        break;
      }
    }
  }
  return map;
}

function formatLastDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function SmartForm({ title, schema, recent, onSubmit, submitting }: SmartFormProps) {
  const tabs = useMemo(() => groupToTabs(schema), [schema]);
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');
  const [values, setValues] = useState<Record<string, string>>({});
  const [parkingRecords, setParkingRecords] = useState<Array<{ start: string; end: string; reason: string }>>([
    { start: '', end: '', reason: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const lastValues = useMemo(() => buildLastValues(recent), [recent]);

  // 所有可见字段（不含 hidden/date/parking）
  const visibleFields = useMemo(() => schema.filter((f) => !f.hidden && f.type !== 'text' || f.id === 'parkingRecords'), [schema]);
  const realVisibleFields = useMemo(
    () => schema.filter((f) => !f.hidden && f.type === 'number'),
    [schema],
  );
  const totalVisible = realVisibleFields.length;
  const filledCount = realVisibleFields.filter((f) => values[f.id] !== undefined && values[f.id] !== '').length;
  const isAllFilled = filledCount >= totalVisible;

  const handleChange = (id: string, val: string) => {
    // 数字字段只允许输入数字和小数点
    if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
      setValues((prev) => ({ ...prev, [id]: val }));
    }
  };

  const handleSubmit = async () => {
    if (filledCount === 0) return;
    // 组装数据
    const data: Record<string, string | number | null> = {};
    // hidden 的 field_date 自动填今天
    schema.forEach((f) => {
      if (f.hidden && f.type === 'date') {
        data[f.id] = todayStr();
      }
    });
    // 可见数字字段
    realVisibleFields.forEach((f) => {
      const v = values[f.id];
      data[f.id] = v === undefined || v === '' ? null : Number(v);
    });
    // 停车记录（过滤空的）
    const validParking = parkingRecords.filter((r) => r.start || r.end || r.reason);
    if (validParking.length > 0) {
      data.parkingRecords = JSON.stringify(validParking);
    }
    await onSubmit(data);
    setSubmitted(true);
  };

  // 提交成功页
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-card" style={{ padding: 24 }}>
        <div className="bg-surface-panel border border-hairline rounded-lg text-center max-w-[420px] w-full shadow-raised" style={{ padding: 40 }}>
          <div className="w-14 h-14 rounded-full bg-success-soft flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="font-display text-ink text-[22px] mb-1" style={{ letterSpacing: '-0.3px' }}>
            提交成功！
          </h2>
          <p className="text-[13px] text-muted mb-6">感谢您的填写</p>
          <Button className="w-full h-11" onClick={() => window.location.reload()}>
            再填一份
          </Button>
        </div>
      </div>
    );
  }

  const currentTab = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  // 每个 Tab 的未填数量
  const unfilledOf = (tab: TabPage): number => {
    if (tab.id === 'parking') return 0;
    return tab.fields.filter((f) => {
      const v = values[f.id];
      return v === undefined || v === '';
    }).length;
  };

  return (
    <div className="form-fill-container" style={{ height: '100vh', background: '#f5f5f5', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      <div className="form-fill-card" style={{ width: '100%', maxWidth: 480, background: '#fff', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        {/* 头部 —— 固定 */}
        <div className="form-fill-header" style={{ flex: '0 0 auto', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="font-display text-ink text-[17px]" style={{ letterSpacing: '-0.2px' }}>
              {title}
            </h1>
            <span className="text-[11px] text-muted-soft">{todayDisplay()}</span>
          </div>
        </div>

        {/* Tabs 标签 —— 可横滑 */}
        <div className="form-fill-tabs" style={{ flex: '0 0 auto', padding: '8px 12px 0', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 4, overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const unfilled = unfilledOf(tab);
            const Icon = tab.icon === 'tank' ? AppWindow : tab.icon === 'meter' ? Zap : Car;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors duration-120 ease-out-expo whitespace-nowrap',
                  isActive ? 'bg-accent-faint text-accent-hover' : 'bg-surface-card text-muted hover:text-ink',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.title}
                {unfilled > 0 && (
                  <span className={cn('text-[10px] tnum px-1 rounded-full', isActive ? 'bg-accent text-white' : 'bg-muted-faint text-muted')}>
                    {unfilled}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 内容区 —— 独立滚动 */}
        <div className="form-fill-content" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 20 }}>
          {currentTab?.id === 'parking' ? (
            /* 停车记录 Tab */
            <div style={{ padding: '12px 16px' }}>
              {parkingRecords.map((record, index) => (
                <div key={index} className="bg-surface-soft border border-hairline rounded-lg p-3 mb-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-semibold text-ink">停车记录 {index + 1}</span>
                    {parkingRecords.length > 1 && (
                      <button
                        onClick={() => setParkingRecords((prev) => prev.filter((_, i) => i !== index))}
                        className="text-[12px] text-danger hover:underline"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] text-muted-soft mb-1">开始时间</label>
                      <input
                        type="datetime-local"
                        value={record.start}
                        onChange={(e) => setParkingRecords((prev) => prev.map((r, i) => (i === index ? { ...r, start: e.target.value } : r)))}
                        className="bloom h-9 w-full px-2.5 text-[13px] text-ink bg-canvas border border-hairline rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-soft mb-1">结束时间</label>
                      <input
                        type="datetime-local"
                        value={record.end}
                        onChange={(e) => setParkingRecords((prev) => prev.map((r, i) => (i === index ? { ...r, end: e.target.value } : r)))}
                        className="bloom h-9 w-full px-2.5 text-[13px] text-ink bg-canvas border border-hairline rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-soft mb-1">停车原因</label>
                      <input
                        type="text"
                        placeholder="请输入停车原因"
                        value={record.reason}
                        onChange={(e) => setParkingRecords((prev) => prev.map((r, i) => (i === index ? { ...r, reason: e.target.value } : r)))}
                        className="bloom h-9 w-full px-2.5 text-[13px] text-ink bg-canvas border border-hairline rounded-md"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setParkingRecords((prev) => [...prev, { start: '', end: '', reason: '' }])}
                className="w-full py-2.5 border border-dashed border-hairline rounded-md text-[13px] text-muted hover:text-ink hover:border-ink transition-colors duration-120 ease-out-expo flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                新增停车记录
              </button>
            </div>
          ) : (
            /* 数据字段列表 —— 三段式 item-row */
            <div>
              {currentTab?.fields.map((field) => {
                const v = values[field.id] ?? '';
                const hasChange = v !== '';
                const last = lastValues[field.id];
                return (
                  <div
                    key={field.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 border-b border-hairline-soft transition-colors duration-120 ease-out-expo',
                      hasChange && 'bg-accent-faint/40',
                    )}
                  >
                    {/* 左：字段名 */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-ink truncate">{field.title}</div>
                      {field.description && (
                        <div className="text-[11px] text-muted-soft truncate">{field.description}</div>
                      )}
                    </div>
                    {/* 中：上次值 */}
                    <div className="flex flex-col items-center justify-center px-1 border-l border-r border-hairline-soft" style={{ flex: '0 0 60px', height: 36 }}>
                      <span className="text-[9px] text-muted-soft font-semibold uppercase leading-none mb-0.5">
                        上次{last ? `(${formatLastDate(last.date)})` : ''}
                      </span>
                      <span className="text-[12px] font-bold text-muted tnum">
                        {last?.value ?? '--'}
                      </span>
                    </div>
                    {/* 右：输入框 + 单位 */}
                    <div className="flex items-center gap-1 justify-end" style={{ flex: '0 0 130px' }}>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="--"
                        value={v}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className={cn(
                          'h-9 px-2 text-[15px] font-bold text-ink bg-canvas border rounded-md text-right tnum outline-none transition-all duration-120 ease-out-expo',
                          hasChange ? 'border-ink shadow-[0_0_0_3px_rgba(17,17,17,0.08)]' : 'border-hairline',
                        )}
                        style={{ width: field.suffix ? 95 : 115 }}
                      />
                      {field.suffix && <span className="text-[11px] font-bold text-muted-soft min-w-[16px]">{field.suffix}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部吸底提交按钮 */}
        <div className="form-fill-footer" style={{ flex: '0 0 auto', padding: '12px 16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <Button
            className="w-full"
            style={{ height: 48, fontSize: 16, borderRadius: 12 }}
            disabled={!isAllFilled || submitting}
            onClick={handleSubmit}
          >
            {submitting ? '正在提交…' : `确认并提交 (${filledCount}/${totalVisible})`}
          </Button>
        </div>
      </div>

      {/* 移动端 480px 适配 */}
      <style jsx global>{`
        @media (max-width: 480px) {
          .form-fill-card { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}
