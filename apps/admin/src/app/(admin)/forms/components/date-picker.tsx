'use client';
/**
 * DatePicker —— 轻量内联日历弹层（零依赖）
 *
 * 设计：点击触发器（日历图标）展开一个月网格浮层，选完日期回调。
 * 用于 DataSheet 的日期单元格 —— 不抢文本输入框的焦点，
 * 选完后把值写回父组件的 draft。
 *
 * 视觉对齐 DESIGN.md：白底内容卡 + hairline + lift 阴影 + anim-pop 动画。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DatePickerProps {
  /** 当前值 'YYYY-MM-DD'，空字符串表示无 */
  value: string;
  /** 选定日期后回调 */
  onChange: (value: string) => void;
  /** 触发器（图标按钮）；组件会给它加 onClick */
  trigger: React.ReactNode;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/** 把 'YYYY-MM-DD' 解析成 {y,m,d}，无效返回 null */
function parseYMD(s: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return { y: +m[1], m: +m[2] - 1, d: +m[3] };
}

/** 组装成 'YYYY-MM-DD' */
function toYMD(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

/** 当月天数 */
function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function DatePicker({ value, onChange, trigger }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // 锚定日历视图到 value 所在月，无 value 则当月
  const initial = useMemo(() => {
    const p = parseYMD(value);
    if (p) return p;
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  }, [value, open]); // open 变化时重新计算，保证每次打开都对齐当前值

  const [view, setView] = useState({ y: initial.y, m: initial.m });

  // 每次打开时把视图月份对齐到 value
  useEffect(() => {
    if (!open) return;
    const p = parseYMD(value);
    if (p) setView({ y: p.y, m: p.m });
    else {
      const now = new Date();
      setView({ y: now.getFullYear(), m: now.getMonth() });
    }
  }, [open, value]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const today = useMemo(() => {
    const n = new Date();
    return toYMD(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  // 构建当月网格（周一开始，前置补上月末尾几天）
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    // JS: 0=周日。换算成"周一开始"的列偏移
    const offset = (first.getDay() + 6) % 7;
    const total = daysInMonth(view.y, view.m);
    const prevTotal = daysInMonth(view.y, view.m - 1);

    const arr: Array<{ d: number; cur: boolean; ymd: string }> = [];
    // 前置（上月尾）
    for (let i = offset - 1; i >= 0; i--) {
      const d = prevTotal - i;
      const pm = view.m - 1 < 0 ? 11 : view.m - 1;
      const py = view.m - 1 < 0 ? view.y - 1 : view.y;
      arr.push({ d, cur: false, ymd: toYMD(py, pm, d) });
    }
    // 当月
    for (let d = 1; d <= total; d++) {
      arr.push({ d, cur: true, ymd: toYMD(view.y, view.m, d) });
    }
    // 后置（下月头，补齐到 42 格 = 6 行）
    const tail = 42 - arr.length;
    for (let d = 1; d <= tail; d++) {
      const nm = view.m + 1 > 11 ? 0 : view.m + 1;
      const ny = view.m + 1 > 11 ? view.y + 1 : view.y;
      arr.push({ d, cur: false, ymd: toYMD(ny, nm, d) });
    }
    return arr;
  }, [view]);

  const prevMonth = () => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const nextMonth = () => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const selected = value;

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        // 用 mousedown 而非 click：mousedown 阶段 preventDefault 可阻止
        // 外层 input 失焦（否则 input onBlur 先触发 → 编辑态卸载 → 日历一起销毁）
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex cursor-pointer"
        title="选择日期"
      >
        {trigger}
      </button>
      {open && (
        <div
          className="anim-pop absolute top-full right-0 mt-1 z-50 bg-surface-panel border border-hairline rounded-lg shadow-overlay p-3 w-[260px]"
          // preventDefault 阻止 focus 转移到日历内的 button，
          // 从而避免外层 input 失焦卸载（stopPropagation 管不了 focus）
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-semibold text-ink">
              {view.y}年 {MONTH_NAMES[view.m]}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* 星期表头 */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[11px] text-muted-soft font-medium h-6 leading-6">
                {w}
              </div>
            ))}
          </div>
          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((c, i) => {
              const isSelected = c.ymd === selected;
              const isToday = c.ymd === today;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(c.ymd);
                    setOpen(false);
                  }}
                  className={cn(
                    'h-7 rounded-md text-[12px] tnum transition-colors',
                    c.cur ? 'text-ink hover:bg-surface-soft' : 'text-muted-faint hover:bg-surface-soft',
                    isSelected && 'bg-ink text-white hover:bg-ink-soft',
                    !isSelected && isToday && 'ring-1 ring-ink',
                  )}
                >
                  {c.d}
                </button>
              );
            })}
          </div>
          {/* 底部：今天 / 清除 */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-hairline-soft">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              className="text-[12px] text-muted hover:text-ink transition-colors"
            >
              今天
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-[12px] text-muted hover:text-danger transition-colors"
            >
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
