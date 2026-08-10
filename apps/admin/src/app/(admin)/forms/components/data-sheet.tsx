'use client';
/**
 * DataSheet —— 自研可编辑表格组件
 *
 * 设计原则：
 * 1. 零三方依赖，纯 React + 受控状态，行为完全可控、可预测
 * 2. 单击即编辑（无"选中态"中间层）—— 适配车间录入员的快速录入场景
 * 3. 编辑态/非编辑态盒模型完全一致（inset-0 + 同 padding + outline 高亮），
 *    切换时文字零位移
 * 4. 键盘导航用 useLayoutEffect 同步 draft + scrollIntoView，跨单元格不串值、不丢焦点
 * 5. suppressBlur ref 屏蔽 onBlur 竞态，Enter 只提交一次、Esc 真正取消
 *
 * 视觉对齐 DESIGN.md：白底 / hairline / row-wash / 8px 圆角输入
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, Undo2, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { FormField, FormSchema, FormSubmission } from '@/lib/forms-data';

type CellValue = string | number | null;
type RowData = Record<string, CellValue>;

interface InternalRow {
  _id?: string;
  _state: 'saved' | 'created' | 'updated';
  data: RowData;
}

interface DataSheetProps {
  schema: FormSchema;
  submissions: FormSubmission[];
}

const ROW_NO_W = 48; // 行号列固定宽度（px），冻结列 left 偏移基准
const FROZEN_COLS = 1; // 冻结前 N 列（field_date）

function hydrate(submissions: FormSubmission[]): InternalRow[] {
  return submissions.map((s) => ({ _id: s.id, _state: 'saved' as const, data: { ...s.data } }));
}

/** 数字字段：校验输入是否合法 */
function isValidNumber(raw: string): boolean {
  if (raw.trim() === '') return true;
  return !Number.isNaN(Number(raw));
}

/** 强制按字段类型规整输入值（commit 时调用） */
function coerce(raw: string, field: FormField): CellValue {
  const trimmed = raw.trim();
  if (field.type === 'number') {
    if (trimmed === '') return null;
    const n = Number(trimmed);
    if (Number.isNaN(n)) return null;
    return field.precision ? +n.toFixed(field.precision) : n;
  }
  return trimmed === '' ? '' : trimmed;
}

/** 渲染单元格显示值 */
function display(value: CellValue, field: FormField): string {
  if (value === null || value === undefined || value === '') return '';
  if (field.type === 'number') {
    const n = Number(value);
    if (Number.isNaN(n)) return '';
    return field.precision ? n.toFixed(field.precision) : String(n);
  }
  if (field.type === 'select') {
    return field.options?.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}

interface ColumnGroup {
  name: string;
  count: number;
}
function computeGroups(schema: FormSchema): ColumnGroup[] {
  const groups: ColumnGroup[] = [];
  schema.forEach((f) => {
    const g = f.group ?? '其他';
    const last = groups[groups.length - 1];
    if (last && last.name === g) last.count++;
    else groups.push({ name: g, count: 1 });
  });
  return groups;
}

export function DataSheet({ schema, submissions }: DataSheetProps) {
  const [rows, setRows] = useState<InternalRow[]>(() => hydrate(submissions));
  const [deleted, setDeleted] = useState<string[]>([]);
  const [editing, setEditing] = useState<{ row: number; col: number } | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  /** 屏蔽 onBlur 的导航/取消场景，避免重复提交与 Esc 失效 */
  const suppressBlur = useRef(false);
  /** 跟踪外部 submissions 引用，供 reset 与 hydrate 判断使用 */
  const submissionsRef = useRef(submissions);

  const groups = useMemo(() => computeGroups(schema), [schema]);

  // 每个字段所属分组的索引 —— 用于交替底色（奇数组 #F8F9FA，偶数组 #FFFFFF）
  const fieldGroupIdx = useMemo(() => {
    const map: number[] = [];
    let gi = 0;
    schema.forEach((f, i) => {
      const g = f.group ?? '其他';
      if (i > 0 && g !== (schema[i - 1].group ?? '其他')) gi++;
      map.push(gi);
    });
    return map;
  }, [schema]);

  /** 分组底色：奇数 index → 浅灰 surface-inset，偶数 → 白 canvas */
  const groupBg = (gIdx: number) => (gIdx % 2 === 1 ? 'bg-surface-inset' : 'bg-canvas');

  const isDirty = useMemo(
    () => rows.some((r) => r._state !== 'saved') || deleted.length > 0,
    [rows, deleted],
  );

  // ── 提交草稿到指定单元格（幂等：未变化则跳过）──
  const commitDraft = useCallback(
    (rowIdx: number, colIdx: number, finalValue?: string) => {
      const field = schema[colIdx];
      if (!field || rowIdx < 0 || rowIdx >= rows.length) return;
      const v = coerce(finalValue ?? draft, field);
      setRows((prev) =>
        prev.map((r, i) => {
          if (i !== rowIdx) return r;
          if (r.data[field.id] === v) return r;
          return {
            ...r,
            data: { ...r.data, [field.id]: v },
            _state: r._state === 'created' ? 'created' : 'updated',
          };
        }),
      );
    },
    [draft, schema, rows.length],
  );

  // ── 统一进入编辑入口：同步 draft 到目标格的当前值 ──
  const enterEdit = useCallback(
    (row: number, col: number) => {
      if (row < 0 || row >= rows.length || col < 0 || col >= schema.length) return;
      const field = schema[col];
      const current = rows[row]?.data[field.id];
      setDraft(current == null ? '' : String(current));
      setEditing({ row, col });
    },
    [rows, schema],
  );

  // ── 计算下一个单元格坐标（含 Tab 换行 / 边界钳制）──
  const computeNext = useCallback(
    (cur: { row: number; col: number }, dir: 'up' | 'down' | 'left' | 'right') => {
      let { row, col } = cur;
      if (dir === 'up') row = Math.max(0, row - 1);
      else if (dir === 'down') row = Math.min(rows.length - 1, row + 1);
      else if (dir === 'left') col = Math.max(0, col - 1);
      else if (dir === 'right') col = Math.min(schema.length - 1, col + 1);
      return { row, col };
    },
    [rows.length, schema.length],
  );

  // ── 导航：提交 + 跳格（统一设置 suppressBlur 防止 onBlur 二次提交）──
  const navigate = useCallback(
    (dir: 'up' | 'down' | 'left' | 'right') => {
      if (!editing) return;
      suppressBlur.current = true;
      commitDraft(editing.row, editing.col);
      const next = computeNext(editing, dir);
      if (next.row === editing.row && next.col === editing.col) {
        // 到边界了，停在原地，但仍要恢复 blur
        suppressBlur.current = false;
        return;
      }
      enterEdit(next.row, next.col);
      // 下一 tick 恢复，确保新 input 的 focus 不被旧 input 的 blur 干扰
      queueMicrotask(() => {
        suppressBlur.current = false;
      });
    },
    [editing, commitDraft, computeNext, enterEdit],
  );

  // ── editing 变化时：focus + select + scrollIntoView（useLayoutEffect 防 paint 闪烁）──
  useLayoutEffect(() => {
    if (!editing || !inputRef.current) return;
    const el = inputRef.current;
    el.focus();
    if (el instanceof HTMLInputElement) el.select();
    // 仅在单元格真正离开视口时才滚动（nearest 不打断用户当前滚动位置）
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [editing]);

  // ── 键盘处理 ──
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      const key = e.key;
      const target = e.target as HTMLInputElement;
      const isInput = target.tagName === 'INPUT';
      const isTextLike = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Esc：取消，丢弃草稿（设 suppressBlur 让 onBlur 不再提交）
      if (key === 'Escape') {
        e.preventDefault();
        suppressBlur.current = true;
        setEditing(null);
        queueMicrotask(() => {
          suppressBlur.current = false;
        });
        return;
      }

      // Enter：提交并下移
      if (key === 'Enter') {
        e.preventDefault();
        navigate('down');
        return;
      }

      // Tab：提交并横移（Shift 反向）
      if (key === 'Tab') {
        e.preventDefault();
        navigate(e.shiftKey ? 'left' : 'right');
        return;
      }

      // ↑↓：提交并上下移（但 select 展开时不拦截，让用户用方向键选选项）
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        if (target.tagName === 'SELECT' && target.size <= 1) {
          // 单选 select 在折叠态：不拦截，让浏览器切换选项
          // 但实际上我们的 select 是折叠下拉，方向键应导航
        }
        e.preventDefault();
        navigate(key === 'ArrowDown' ? 'down' : 'up');
        return;
      }

      // ←→：input 内移动光标；光标在边界时才跳列
      if (isTextLike && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        if (isInput) {
          const { selectionStart: s, selectionEnd: en, value } = target;
          const hasSelection = s !== en;
          if (hasSelection) return; // 选中文本时不跳
          if (key === 'ArrowLeft' && s !== 0) return; // 不在最左
          if (key === 'ArrowRight' && en !== value.length) return; // 不在最右
        }
        e.preventDefault();
        navigate(key === 'ArrowLeft' ? 'left' : 'right');
      }
    },
    [navigate],
  );

  // ── onBlur：非导航场景下提交（导航/取消已设 suppressBlur 跳过）──
  const handleBlur = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (suppressBlur.current) return; // 主动导航/取消触发的卸载，不提交
      commitDraft(rowIdx, colIdx);
      setEditing(null);
    },
    [commitDraft],
  );

  // ── 增删行 ──
  const addRow = useCallback(() => {
    const empty: RowData = {};
    schema.forEach((f) => {
      empty[f.id] = f.type === 'number' ? null : '';
    });
    setRows((prev) => [{ _state: 'created' as const, data: empty }, ...prev]);
    // 滚动到顶部让新行可见
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    // 等下一帧 DOM 挂载后再 enterEdit
    requestAnimationFrame(() => enterEdit(0, 0));
  }, [schema, enterEdit]);

  const deleteRow = useCallback(
    (rowIdx: number) => {
      const target = rows[rowIdx];
      const tid = target?._id;
      if (tid) setDeleted((d) => [...d, tid]);
      setRows((prev) => prev.filter((_, i) => i !== rowIdx));
      if (editing?.row === rowIdx) setEditing(null);
    },
    [rows, editing],
  );

  // ── 保存 / 撤销 ──
  const save = useCallback(() => {
    setRows((prev) => prev.map((r) => ({ ...r, _state: 'saved' as const, data: { ...r.data } })));
    setDeleted([]);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  }, []);

  const reset = useCallback(() => {
    setRows(hydrate(submissionsRef.current));
    setDeleted([]);
    setEditing(null);
  }, []);

  // ── 导出 CSV ──
  const exportCsv = useCallback(() => {
    const headers = schema.map((f) => f.title);
    const body = rows.map((r) => schema.map((f) => display(r.data[f.id], f)));
    const escape = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    const csv = [headers, ...body].map((line) => line.map(escape).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `硫酸车间报表_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows, schema]);

  const stats = useMemo(() => {
    const created = rows.filter((r) => r._state === 'created').length;
    const updated = rows.filter((r) => r._state === 'updated').length;
    return { created, updated, deleted: deleted.length };
  }, [rows, deleted]);

  // 外部 submissions 引用变化 → 重新 hydrate（标准 useEffect，避免 render 阶段 setState）
  useEffect(() => {
    if (submissionsRef.current === submissions) return;
    submissionsRef.current = submissions;
    setRows(hydrate(submissions));
    setDeleted([]);
    setEditing(null);
  }, [submissions]);

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex items-center gap-2.5 px-6 py-3.5 border-b border-hairline-soft">
        <Button size="sm" onClick={addRow}>
          <Plus className="w-3.5 h-3.5" />
          新增行
        </Button>
        <Button size="sm" variant="ghost" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="w-3.5 h-3.5" />
          导出 CSV
        </Button>
        <div className="ml-auto flex items-center gap-2.5">
          {isDirty && (
            <span className="text-[12px] text-warning flex items-center gap-1">
              <Undo2 className="w-3 h-3" />
              有未保存的更改
              {stats.created > 0 && <span className="tnum">· 新增 {stats.created}</span>}
              {stats.updated > 0 && <span className="tnum">· 修改 {stats.updated}</span>}
              {stats.deleted > 0 && <span className="tnum">· 删除 {stats.deleted}</span>}
            </span>
          )}
          {savedAt && <span className="text-[12px] text-success">✓ 已保存</span>}
          {isDirty && (
            <Button size="sm" variant="ghost" onClick={reset}>
              撤销
            </Button>
          )}
          <Button size="sm" variant={isDirty ? 'primary' : 'outline'} onClick={save} disabled={!isDirty}>
            <Save className="w-3.5 h-3.5" />
            保存修改
          </Button>
        </div>
      </div>

      {/* 表格区 —— 横向 + 纵向滚动；分组双行表头 + 冻结首列 */}
      <div ref={scrollRef} className="overflow-auto max-h-[calc(100vh-300px)]">
        <table className="border-separate border-spacing-0" style={{ minWidth: schema.length * 100 }}>
          <thead className="sticky top-0 z-20">
            {/* 第一行：分组 */}
            <tr>
              <th
                rowSpan={2}
                style={{ width: ROW_NO_W, minWidth: ROW_NO_W, maxWidth: ROW_NO_W }}
                className="sticky left-0 z-30 bg-surface-inset text-muted-soft text-[12px] font-semibold h-11 px-2 border-b border-r border-hairline tnum text-center"
              >
                #
              </th>
              {groups.map((g, gi) => (
                <th
                  key={g.name}
                  colSpan={g.count}
                  className={cn(
                    'text-[11px] font-medium text-muted-soft h-6 px-2 border-b border-hairline text-center whitespace-nowrap',
                    groupBg(gi),
                  )}
                >
                  {g.count > 1 ? g.name : ''}
                </th>
              ))}
              <th rowSpan={2} className="bg-surface-inset text-muted-soft text-[12px] font-semibold h-11 min-w-12 px-2 border-b border-hairline" />
            </tr>
            {/* 第二行：字段标题 */}
            <tr>
              {schema.map((f, i) => {
                const isFrozen = i < FROZEN_COLS;
                const left = isFrozen ? ROW_NO_W : undefined;
                const gIdx = fieldGroupIdx[i];
                return (
                  <th
                    key={f.id}
                    className={cn(
                      'text-muted-soft text-[12px] font-semibold h-11 px-2.5 border-b border-r border-hairline whitespace-nowrap text-center',
                      // 冻结列固定白底；其余按所属分组的奇偶交替
                      isFrozen ? 'sticky z-30 bg-canvas' : groupBg(gIdx),
                    )}
                    style={{
                      ...(left !== undefined ? { left } : {}),
                      ...(f.width ? { width: f.width, minWidth: f.width } : {}),
                    }}
                  >
                    <span className="inline-flex items-baseline gap-0.5">
                      {f.title}
                      {f.unit && <span className="text-muted-faint font-normal text-[10px]">{f.unit}</span>}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={schema.length + 2} className="text-center text-muted py-16 bg-surface-panel">
                  暂无数据，点击「新增行」开始录入
                </td>
              </tr>
            )}
            {rows.map((row, rowIdx) => (
              <tr key={row._id ?? `new_${rowIdx}`} className="group">
                {/* 行号 */}
                <td
                  style={{ width: ROW_NO_W, minWidth: ROW_NO_W, maxWidth: ROW_NO_W, left: 0 }}
                  className={cn(
                    'sticky z-10 text-center text-[12px] text-muted-soft tnum px-2 h-11 border-b border-r border-hairline-soft bg-surface-panel',
                    row._state !== 'saved' && 'font-semibold text-warning',
                  )}
                >
                  {rowIdx + 1}
                </td>
                {/* 数据列 */}
                {schema.map((field, colIdx) => {
                  const isEditing = editing?.row === rowIdx && editing?.col === colIdx;
                  const value = row.data[field.id];
                  const changed = row._state !== 'saved';
                  const isFrozen = colIdx < FROZEN_COLS;
                  const isNumber = field.type === 'number';
                  const gIdx = fieldGroupIdx[colIdx];
                  // 非法数字（编辑中）的红框提示
                  const invalidNumber = isEditing && isNumber && !isValidNumber(draft);
                  return (
                    <td
                      key={field.id}
                      onClick={() => {
                        if (isEditing) return;
                        enterEdit(rowIdx, colIdx);
                      }}
                      className={cn(
                        'relative h-11 border-b border-r border-hairline-soft cursor-text px-2.5',
                        'transition-colors duration-120 ease-out-expo',
                        !isEditing && 'row-wash',
                        // 冻结列固定白底；其余按所属分组奇偶交替（与表头一致）
                        isFrozen ? 'sticky z-10 bg-canvas' : groupBg(gIdx),
                        // 编辑态提升层级避免被表头/相邻列盖住
                        isEditing && 'z-30',
                      )}
                      style={isFrozen ? { left: ROW_NO_W } : undefined}
                    >
                      {isEditing ? (
                        field.type === 'select' ? (
                          <select
                            ref={(el) => {
                              inputRef.current = el;
                            }}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => handleBlur(rowIdx, colIdx)}
                            onKeyDown={onKeyDown}
                            className={cn(
                              'absolute inset-0 px-2.5 text-[14px] text-ink bg-transparent text-center',
                              'border border-hairline focus:outline-none',
                            )}
                            style={{
                              boxShadow: '0 0 0 3px rgba(17, 17, 17, 0.08)',
                              borderColor: '#111111',
                            }}
                          >
                            <option value="">—</option>
                            {field.options?.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            ref={(el) => {
                              inputRef.current = el;
                            }}
                            // 统一用 text 类型：避免原生 date input 拦截方向键导致日期段滑动
                            type="text"
                            inputMode={field.type === 'number' ? 'decimal' : undefined}
                            placeholder={field.type === 'date' ? 'YYYY-MM-DD' : undefined}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => handleBlur(rowIdx, colIdx)}
                            onKeyDown={onKeyDown}
                            className={cn(
                              'absolute inset-0 px-2.5 text-[14px] text-ink bg-transparent text-center',
                              isNumber && 'tnum',
                              'border border-hairline focus:outline-none',
                            )}
                            style={{
                              boxShadow: invalidNumber
                                ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
                                : '0 0 0 3px rgba(17, 17, 17, 0.08)',
                              borderColor: invalidNumber ? '#EF4444' : '#111111',
                            }}
                          />
                        )
                      ) : (
                        <div
                          className={cn(
                            'text-[14px] truncate',
                            value === null || value === ''
                              ? 'text-muted-faint'
                              : isFrozen
                                ? 'text-ink font-medium'
                                : changed
                                  ? 'text-ink font-medium'
                                  : 'text-body',
                            // 数字与文本统一居中（与表头一致）
                            isNumber ? 'tnum text-center' : 'text-center',
                          )}
                        >
                          {display(value, field)}
                        </div>
                      )}
                    </td>
                  );
                })}
                {/* 删除 */}
                <td className="px-2 h-11 border-b border-hairline-soft text-center bg-surface-panel">
                  <button
                    onClick={() => deleteRow(rowIdx)}
                    title="删除此行"
                    className="w-7 h-7 inline-flex items-center justify-center text-muted-faint hover:text-danger hover:bg-danger-soft rounded-md transition-colors duration-120 ease-out-expo opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部状态条 —— 快捷键说明 */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-hairline-soft text-[13px]">
        <span className="text-muted tnum">共 {rows.length} 行</span>
        <span className="text-muted-soft flex items-center gap-2 flex-wrap justify-end">
          <Kbd>Enter</Kbd><span>下移</span>
          <Kbd>Tab</Kbd><span>右移</span>
          <Kbd>↑↓</Kbd><span>上下</span>
          <Kbd>←→</Kbd><span>到边界跳列</span>
          <Kbd>Esc</Kbd><span>取消</span>
        </span>
      </div>
    </div>
  );
}

/** 小键盘提示 */
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="font-mono text-[11px] bg-surface-soft border border-hairline rounded-xs px-1.5 py-0.5">
      {children}
    </kbd>
  );
}
