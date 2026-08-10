'use client';
/**
 * DatePicker —— 轻量内联日历（零依赖，React Portal 渲染）
 *
 * 设计要点：
 * 1. 用 createPortal 渲染到 document.body，脱离表格的 overflow-auto 容器，
 *    不被裁剪（对齐项目已有 Radix DropdownMenu 的 Portal 策略）
 * 2. 通过 getBoundingClientRect 动态定位到触发器下方
 * 3. 视觉对齐 DESIGN.md：
 *    - surface-panel 白底 + hairline + shadow-overlay（同 dropdown-menu / dialog）
 *    - anim-pop 弹出动画（同 dropdown）
 *    - display 字体用 font-display（Cal Sans）月份/年份标题
 *    - 选中态 bg-ink text-white（主 CTA 色实心）
 *    - caption / nav-link 字号 token
 *    - 圆角 rounded-md（8px）
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  trigger: React.ReactNode;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTH_NAMES = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

function parseYMD(s: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return { y: +m[1], m: +m[2] - 1, d: +m[3] };
}

function toYMD(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function DatePicker({ value, onChange, trigger }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // 锚定视图月份到 value（打开时同步）
  const initial = useMemo(() => {
    const p = parseYMD(value);
    if (p) return p;
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
  }, [value]);
  const [view, setView] = useState({ y: initial.y, m: initial.m });

  useEffect(() => {
    if (!open) return;
    const p = parseYMD(value);
    if (p) setView({ y: p.y, m: p.m });
    else {
      const now = new Date();
      setView({ y: now.getFullYear(), m: now.getMonth() });
    }
  }, [open, value]);

  // 计算触发器位置（弹层渲染到 body，需手动定位）
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const POP_W = 260;
    const POP_H = 320;
    const margin = 8;
    // 默认放触发器下方；底部不够则放上方
    let top = r.bottom + 4;
    if (top + POP_H > window.innerHeight - margin) {
      top = Math.max(margin, r.top - POP_H - 4);
    }
    // 默认右对齐触发器；左侧不够则贴左边
    let left = r.right - POP_W;
    if (left < margin) left = margin;
    if (left + POP_W > window.innerWidth - margin) left = window.innerWidth - POP_W - margin;
    setCoords({ top, left });
  }, [open]);

  // 外部点击 / Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return; // 触发器自己处理切换
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const today = useMemo(() => {
    const n = new Date();
    return toYMD(n.getFullYear(), n.getMonth(), n.getDate());
  }, []);

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7; // 周一起始
    const total = daysInMonth(view.y, view.m);
    const prevTotal = daysInMonth(view.y, view.m - 1);
    const arr: Array<{ d: number; cur: boolean; ymd: string }> = [];
    for (let i = offset - 1; i >= 0; i--) {
      const d = prevTotal - i;
      const pm = view.m - 1 < 0 ? 11 : view.m - 1;
      const py = view.m - 1 < 0 ? view.y - 1 : view.y;
      arr.push({ d, cur: false, ymd: toYMD(py, pm, d) });
    }
    for (let d = 1; d <= total; d++) arr.push({ d, cur: true, ymd: toYMD(view.y, view.m, d) });
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        // mousedown preventDefault 阻止 input 失焦（否则编辑态卸载，日历一起销毁）
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
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popRef}
            className="anim-pop fixed z-50 bg-surface-panel border border-hairline rounded-lg shadow-overlay p-3"
            style={{ top: coords?.top ?? -9999, left: coords?.left ?? -9999, width: 260 }}
            // 阻止 mousedown 让外层 input 失焦
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* 月份导航 —— display 字体 */}
            <div className="flex items-center justify-between mb-2.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-colors duration-120 ease-out-expo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-display text-ink text-[15px]" style={{ letterSpacing: '-0.2px' }}>
                {view.y}年 {MONTH_NAMES[view.m]}
              </span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center text-muted hover:text-ink hover:bg-surface-soft rounded-md transition-colors duration-120 ease-out-expo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {/* 星期表头 —— caption */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-caption text-muted-soft h-6 leading-6">
                  {w}
                </div>
              ))}
            </div>
            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((c, i) => {
                const isSelected = c.ymd === value;
                const isToday = c.ymd === today;
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(c.ymd);
                      setOpen(false);
                    }}
                    className={cn(
                      'h-7 rounded-md text-caption tnum transition-colors duration-120 ease-out-expo',
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
            {/* 底部快捷 —— text-link 风格 */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-hairline-soft">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(today);
                  setOpen(false);
                }}
                className="text-caption text-muted hover:text-ink transition-colors duration-120 ease-out-expo"
              >
                今天
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-caption text-muted hover:text-danger transition-colors duration-120 ease-out-expo"
              >
                清除
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
