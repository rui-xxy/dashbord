'use client';
/**
 * SmartForm —— 三段式填报表单（对齐原版 admin 设计 + DESIGN.md 视觉升级）
 *
 * 布局（100vh 固定，类手机 App）：
 * - 头部：表单标题 + 今天日期
 * - nav-pill-group tabs：按 group 分，横向可滑；停车记录单独成页
 * - 内容区独立滚动：每行三段式「字段名 | 上次值 | 输入框」
 * - 底部吸底：确认并提交 (n/m)，全填完才启用
 */
import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { FormSchema, FormField, FormSubmissionVo } from '@hgbord/shared';

interface SmartFormProps {
  title: string;
  schema: FormSchema;
  recent: FormSubmissionVo[];
  onSubmit: (data: Record<string, string | number | null>) => Promise<void>;
  submitting?: boolean;
}

interface TabPage {
  id: string;
  title: string;
  fields: FormField[];
  type: 'fields' | 'parking';
}

function groupToTabs(schema: FormSchema): TabPage[] {
  const tabs: TabPage[] = [];
  schema.forEach((f) => {
    if (f.hidden) return; // 跳过 field_date
    if (f.type === 'text') return; // 跳过非数据字段
    const g = f.group ?? '其他';
    const last = tabs[tabs.length - 1];
    if (last && last.title === g) last.fields.push(f);
    else tabs.push({ id: g, title: g, fields: [f], type: 'fields' });
  });
  tabs.push({ id: 'parking', title: '停车记录', fields: [], type: 'parking' });
  return tabs;
}

function todayDisplay(): string {
  return new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toComparableDate(value?: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  // 优先按业务日期 field_date 比较；格式应为 YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return Number(value.replaceAll('-', ''));
  }
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? Number.NEGATIVE_INFINITY : ts;
}

function buildLastValues(recent: FormSubmissionVo[]): Record<string, { value: string | number | null; date: string }> {
  const map: Record<string, { value: string | number | null; date: string }> = {};
  const allFields = new Set<string>();
  recent.forEach((s) => Object.keys(s.data).forEach((k) => allFields.add(k)));
  const byBusinessDateDesc = [...recent].sort((a, b) => {
    const aDate = (a.data.field_date as string | undefined) ?? a.createdAt;
    const bDate = (b.data.field_date as string | undefined) ?? b.createdAt;
    return toComparableDate(bDate) - toComparableDate(aDate);
  });
  for (const fid of allFields) {
    for (const s of byBusinessDateDesc) {
      const v = s.data[fid];
      if (v !== undefined && v !== null && v !== '') {
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

type ParkingRecord = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  reason: string;
};

function createEmptyParkingRecord(date = ''): ParkingRecord {
  return { startDate: date, startTime: '', endDate: date, endTime: '', reason: '' };
}

export function SmartForm({ title, schema, recent, onSubmit, submitting }: SmartFormProps) {
  const tabs = useMemo(() => groupToTabs(schema), [schema]);
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '');
  const [values, setValues] = useState<Record<string, string>>({});
  const [parkings, setParkings] = useState<ParkingRecord[]>([createEmptyParkingRecord(todayStr())]);
  const [submitted, setSubmitted] = useState(false);

  const lastValues = useMemo(() => buildLastValues(recent), [recent]);

  // 所有需填的数字字段（不含 hidden/text）
  const fillableFields = useMemo(() => schema.filter((f) => !f.hidden && f.type === 'number'), [schema]);
  const total = fillableFields.length;
  const filled = fillableFields.filter((f) => values[f.id] !== undefined && values[f.id] !== '').length;
  const isAllFilled = filled >= total;

  const handleChange = (id: string, val: string) => {
    if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
      setValues((prev) => ({ ...prev, [id]: val }));
    }
  };

  const handleSubmit = async () => {
    if (filled === 0) return;
    const data: Record<string, string | number | null> = {};
    // 隐藏的 field_date 自动填今天
    schema.forEach((f) => {
      if (f.hidden && f.type === 'date') data[f.id] = todayStr();
    });
    // 数字字段
    fillableFields.forEach((f) => {
      const v = values[f.id];
      data[f.id] = v === undefined || v === '' ? null : Number(v);
    });
    // 停车记录（过滤空）
    const validParking = parkings
      .map((record) => ({
        start: record.startDate && record.startTime ? `${record.startDate}T${record.startTime}` : '',
        end: record.endDate && record.endTime ? `${record.endDate}T${record.endTime}` : '',
        reason: record.reason.trim(),
      }))
      .filter((record) => record.start || record.end || record.reason);
    if (validParking.length > 0) {
      data.parkingRecords = JSON.stringify(validParking);
    }
    await onSubmit(data);
    setSubmitted(true);
  };

  // 成功页
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-soft p-6">
        <div className="bg-surface-panel border border-hairline rounded-lg text-center max-w-[400px] w-full shadow-raised p-10">
          <div className="w-14 h-14 rounded-full bg-success-soft flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-success" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-ink text-[22px] mb-1" style={{ letterSpacing: '-0.3px' }}>
            提交成功
          </h2>
          <p className="text-[13px] text-muted mb-6">感谢您的填写，数据已记录</p>
          <Button className="w-full h-11" onClick={() => window.location.reload()}>
            再填一份
          </Button>
        </div>
      </div>
    );
  }

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const unfilledOf = (tab: TabPage) => {
    if (tab.type === 'parking') return 0;
    return tab.fields.filter((f) => !values[f.id]).length;
  };

  return (
    <div className="flex justify-center bg-surface-soft" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="flex flex-col w-full max-w-[480px] bg-surface-panel relative">
        {/* ── 头部 ── */}
        <div className="shrink-0 px-5 py-3 border-b border-hairline-soft">
          <h1 className="font-display text-ink text-[17px] leading-tight" style={{ letterSpacing: '-0.2px' }}>
            {title}
          </h1>
          <span className="text-[11px] text-muted-soft">{todayDisplay()}</span>
        </div>

        {/* ── nav-pill-group tabs ── */}
        <div className="shrink-0 px-4 py-2.5 border-b border-hairline-soft">
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-w-full gap-1 bg-surface-soft rounded-md p-1">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const unfilled = unfilledOf(tab);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    'shrink-0 flex items-center justify-center gap-1.5 h-8 rounded-xs text-[13px] font-semibold transition-all duration-120 ease-out-expo whitespace-nowrap px-3',
                    isActive
                      ? 'bg-surface-panel text-ink shadow-lift'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  {tab.title}
                  {unfilled > 0 && (
                    <span
                      className={cn(
                        'text-[10px] tnum px-1.5 py-px rounded-full',
                        isActive ? 'bg-ink text-white' : 'bg-muted-faint/60 text-muted',
                      )}
                    >
                      {unfilled}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          </div>
        </div>

        {/* ── 内容区（独立滚动）── */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          {activeTab?.type === 'fields' && activeTab.fields.map((field) => {
            const v = values[field.id] ?? '';
            const hasChange = v !== '';
            const last = lastValues[field.id];
            return (
              <div
                key={field.id}
                className={cn(
                  'flex items-center gap-3 px-5 transition-colors duration-120 ease-out-expo',
                  'border-b border-hairline-soft',
                  hasChange && 'bg-accent-faint/30',
                )}
                style={{ minHeight: 64 }}
              >
                {/* 左：字段名 + 物料说明 */}
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-bold text-ink leading-tight">{field.title}</div>
                  {field.description && (
                    <div className="text-[11px] text-muted-soft mt-0.5 truncate">{field.description}</div>
                  )}
                </div>

                {/* 中：上次值 */}
                <div className="flex flex-col items-end justify-center shrink-0" style={{ width: 56 }}>
                  <span className="text-[9px] text-muted-soft font-semibold uppercase leading-none mb-0.5">
                    上次{last ? ` ${formatLastDate(last.date)}` : ''}
                  </span>
                  <span className={cn('text-[13px] font-bold tnum', hasChange ? 'text-muted' : 'text-muted-soft')}>
                    {last?.value ?? '--'}
                  </span>
                </div>

                {/* 右：输入框 + 单位 */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="--"
                    value={v}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={cn(
                      'text-right tnum outline-none transition-all duration-120 ease-out-expo',
                      'h-9 px-2.5 text-[15px] font-bold bg-canvas border rounded-md',
                      hasChange
                        ? 'border-ink text-ink shadow-[0_0_0_3px_rgba(17,17,17,0.06)]'
                        : 'border-hairline text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(17,17,17,0.06)]',
                    )}
                    style={{ width: field.suffix ? 88 : 108 }}
                  />
                  {field.suffix && (
                    <span className="text-[11px] font-bold text-muted-soft" style={{ minWidth: 28 }}>
                      {field.suffix}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {activeTab?.type === 'parking' && (
            <div className="px-5 py-4">
              <div className="text-[11px] font-bold text-muted-soft uppercase tracking-wider mb-2">停车记录（可选）</div>
              <p className="text-[12px] text-muted mb-3">如当班存在停车、检修或切换，请单独记录时间和原因。</p>
              {parkings.map((p, i) => (
                <div key={i} className="bg-surface-soft border border-hairline-soft rounded-md p-3 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-ink">记录 {i + 1}</span>
                    {parkings.length > 1 && (
                      <button onClick={() => setParkings((prev) => prev.filter((_, idx) => idx !== i))} className="text-[11px] text-danger hover:underline">
                        删除
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-muted-soft mb-1">开始日期</label>
                      <input
                        type="date"
                        value={p.startDate}
                        onChange={(e) => setParkings((prev) => prev.map((r, idx) => (idx === i ? { ...r, startDate: e.target.value } : r)))}
                        className="bloom h-9 w-full px-2.5 text-[12px] text-ink bg-canvas border border-hairline rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-soft mb-1">开始时间</label>
                      <input
                        type="time"
                        value={p.startTime}
                        onChange={(e) => setParkings((prev) => prev.map((r, idx) => (idx === i ? { ...r, startTime: e.target.value } : r)))}
                        className="bloom h-9 w-full px-2.5 text-[12px] text-ink bg-canvas border border-hairline rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label className="block text-[10px] text-muted-soft mb-1">结束日期</label>
                      <input
                        type="date"
                        value={p.endDate}
                        onChange={(e) => setParkings((prev) => prev.map((r, idx) => (idx === i ? { ...r, endDate: e.target.value } : r)))}
                        className="bloom h-9 w-full px-2.5 text-[12px] text-ink bg-canvas border border-hairline rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted-soft mb-1">结束时间</label>
                      <input
                        type="time"
                        value={p.endTime}
                        onChange={(e) => setParkings((prev) => prev.map((r, idx) => (idx === i ? { ...r, endTime: e.target.value } : r)))}
                        className="bloom h-9 w-full px-2.5 text-[12px] text-ink bg-canvas border border-hairline rounded-md"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-[10px] text-muted-soft mb-1">原因</label>
                    <input
                      type="text"
                      placeholder="请输入停车原因"
                      value={p.reason}
                      onChange={(e) => setParkings((prev) => prev.map((r, idx) => (idx === i ? { ...r, reason: e.target.value } : r)))}
                      className="bloom h-9 w-full px-2.5 text-[12px] text-ink bg-canvas border border-hairline rounded-md"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => setParkings((prev) => [...prev, createEmptyParkingRecord(todayStr())])}
                className="w-full h-8 border border-dashed border-hairline rounded-md text-[12px] text-muted hover:text-ink hover:border-ink transition-colors duration-120 ease-out-expo"
              >
                + 新增停车记录
              </button>
            </div>
          )}
        </div>

        {/* ── 底部吸底提交 ── */}
        <div className="shrink-0 px-5 py-3 border-t border-hairline-soft bg-surface-panel">
          <Button
            className="w-full"
            style={{ height: 46, fontSize: 15, borderRadius: 10 }}
            disabled={!isAllFilled || submitting}
            onClick={handleSubmit}
          >
            {submitting ? '提交中…' : `确认并提交 (${filled}/${total})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
