/**
 * 表单管理 —— 原型数据 + Schema
 *
 * 当前为纯前端原型，后端 form 模块尚未实现。
 * 字段定义严格对齐 b2-source 的 form 6（硫酸车间报表）的真实填报字段：
 * 不包含后端计算出来的产量/折98总量，只保留员工每天实际抄录的原始数据。
 *
 * 字段来源：apps/server/scripts/import_sulfuric_data.ts 的 INDEX_MAPPING
 *   + apps/server/src/modules/production/production.service.ts 的 MATERIALS 映射
 *   + apps/admin/src/pages/FormFill/index.tsx 的停车记录（parkingRecords）
 */

// ═══════════════════════════════════════════════════════════
// 表单 Schema —— 字段类型
// ═══════════════════════════════════════════════════════════

export type FieldType = 'text' | 'number' | 'date' | 'select';

export interface FieldOption {
  label: string;
  value: string;
}

/** 单个字段定义 */
export interface FormField {
  id: string;
  title: string;
  type: FieldType;
  /** 字段在表单里所属的分组（用于列分组展示） */
  group?: string;
  /** select 类型专用 */
  options?: FieldOption[];
  /** 数字字段：保留几位小数（仅展示/编辑时约束） */
  precision?: number;
  /** 单位（展示在列头或单元格里） */
  unit?: string;
  /** 列宽（px），不填走默认 */
  width?: number;
}

/** 表单的字段集合（顺序即列顺序） */
export type FormSchema = FormField[];

// ═══════════════════════════════════════════════════════════
// 表单 VO
// ═══════════════════════════════════════════════════════════

/** 表单 VO（对外的表单对象） */
export interface FormVo {
  id: string;
  title: string;
  description?: string;
  schema: FormSchema;
  /** 已收集份数 */
  collected: number;
  updatedAt: string;
}

/** 一行提交记录 —— data 的 key 是 FormField.id */
export interface FormSubmission {
  id: string;
  data: Record<string, string | number | null>;
  /** 业务日期（按表单 field_date 字段或提交时间） */
  date: string;
  /** 录入时间 */
  submittedAt: string;
}

// ═══════════════════════════════════════════════════════════
// 硫酸车间报表 Schema —— 严格对齐 b2-source form 6 真实字段
// 数据来源：apps/server/all_forms_debug.json (form id=6)
// 字段标题沿用真实填报用的储罐编号/名称（2#/3#/拨酸槽 等）
// 分组按物料类别细分，便于横向对比同组储罐
// ═══════════════════════════════════════════════════════════

const SULFURIC_SCHEMA: FormSchema = [
  // ── 基础 ──
  { id: 'field_date', title: '日期', type: 'date', group: '基础', width: 110 },

  // ── 98%硫酸 储罐液位（%）──
  { id: 'tank_98-1', title: '2#', type: 'number', group: '98%硫酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_98-2', title: '3#', type: 'number', group: '98%硫酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_98-3', title: '4#', type: 'number', group: '98%硫酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_98-4', title: '拨酸槽', type: 'number', group: '98%硫酸', precision: 1, unit: '%', width: 80 },

  // ── 发烟硫酸 储罐液位（%）──
  { id: 'tank_fy-1', title: '1#', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_fy-2', title: '5#', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_fy-3', title: '烟酸拨酸槽', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', width: 90 },
  { id: 'tank_fy-4', title: '氨基磺酸转运槽', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', width: 110 },

  // ── 试剂酸 储罐液位（%）──
  { id: 'tank_jp-1', title: '1#', type: 'number', group: '试剂酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_jp-2', title: '2#', type: 'number', group: '试剂酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_jp-3', title: '3#', type: 'number', group: '试剂酸', precision: 1, unit: '%', width: 70 },
  { id: 'tank_jp-4', title: '4#', type: 'number', group: '试剂酸', precision: 1, unit: '%', width: 70 },

  // ── 其他储罐（%）──
  { id: 'tank_syc-1', title: '双氧水储罐', type: 'number', group: '其他储罐', precision: 1, unit: '%', width: 100 },

  // ── 仪表读数（电表度数）──
  { id: 'meter_3', title: '1#电机', type: 'number', group: '仪表读数', precision: 2, width: 80 },
  { id: 'meter_4', title: '2#电机', type: 'number', group: '仪表读数', precision: 2, width: 80 },
  { id: 'meter_5', title: '1#电炉', type: 'number', group: '仪表读数', precision: 2, width: 80 },
  { id: 'meter_6', title: '2#电炉', type: 'number', group: '仪表读数', precision: 2, width: 80 },
  { id: 'meter_mgso4_phase2', title: '硫酸镁二期电表', type: 'number', group: '仪表读数', precision: 2, width: 120 },
  { id: 'meter_amino', title: '氨基磺酸电表', type: 'number', group: '仪表读数', precision: 2, width: 110 },

  // ── 其他（提交时附加）──
  { id: 'parkingRecords', title: '停车情况', type: 'text', group: '其他', width: 200 },
];

// ═══════════════════════════════════════════════════════════
// 原型数据 —— 表单列表（仅硫酸车间报表）
// ═══════════════════════════════════════════════════════════

export const MOCK_FORMS: FormVo[] = [
  {
    id: 'f_001',
    title: '硫酸车间报表',
    description: '每日生产数据填报（储罐液位 + 仪表读数）',
    schema: SULFURIC_SCHEMA,
    collected: 1284,
    updatedAt: '2026-08-11T08:30:00.000Z',
  },
];

// ═══════════════════════════════════════════════════════════
// 原型数据 —— 提交记录（硫酸车间报表，最近 12 天）
// ═══════════════════════════════════════════════════════════

const PARKING_SAMPLES = [
  { start: '', end: '', reason: '' },
  { start: '2026-08-10T10:00', end: '2026-08-10T11:30', reason: '1#锅炉换管' },
  { start: '2026-08-07T14:00', end: '2026-08-07T15:00', reason: '检修结束恢复' },
];

/** 把 parkingRecords 数组转成摘要字符串展示 */
function parkingToText(records?: Array<{ start?: string; end?: string; reason?: string }>): string {
  if (!records || records.length === 0) return '';
  return records
    .map((r) => {
      const timePart = [r.start?.slice(11, 16), r.end?.slice(11, 16)].filter(Boolean).join('~');
      return [timePart, r.reason].filter(Boolean).join(' ');
    })
    .filter(Boolean)
    .join('; ');
}

function genSulfuricRows(): FormSubmission[] {
  const rows: FormSubmission[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date('2026-08-11T00:00:00.000Z');
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // 储罐液位：60~95% 之间波动（真实业务里液位不会剧烈变化）
    const lvl = (base: number, variance: number) =>
      +(Math.max(20, Math.min(98, base + Math.sin(i + variance) * variance + Math.random() * 4))).toFixed(1);
    rows.push({
      id: `s_${1000 + i}`,
      date: dateStr,
      submittedAt: `${dateStr}T18:30:00.000Z`,
      data: {
        field_date: dateStr,
        'tank_98-1': lvl(82, 6),
        'tank_98-2': lvl(75, 5),
        'tank_98-3': lvl(68, 7),
        'tank_98-4': lvl(88, 4),
        'tank_fy-1': lvl(70, 8),
        'tank_fy-2': lvl(65, 6),
        'tank_fy-3': lvl(72, 5),
        'tank_fy-4': lvl(80, 7),
        'tank_jp-1': lvl(55, 9),
        'tank_jp-2': lvl(62, 6),
        'tank_jp-3': lvl(48, 8),
        'tank_jp-4': lvl(70, 5),
        'tank_syc-1': lvl(78, 6),
        // 仪表读数（电表度数，量级 4 位数）
        meter_3: +(12480 + Math.sin(i) * 400 + Math.random() * 80).toFixed(2),
        meter_4: +(9820 + Math.cos(i) * 300 + Math.random() * 60).toFixed(2),
        meter_5: +(4560 + Math.random() * 120).toFixed(2),
        meter_6: +(3120 + Math.random() * 90).toFixed(2),
        meter_mgso4_phase2: +(2840 + Math.random() * 100).toFixed(2),
        meter_amino: +(1560 + Math.random() * 70).toFixed(2),
        parkingRecords: parkingToText(i === 1 ? [PARKING_SAMPLES[1]] : i === 4 ? [PARKING_SAMPLES[2]] : undefined) as unknown as string,
      },
    });
  }
  return rows;
}

export const MOCK_SUBMISSIONS: Record<string, FormSubmission[]> = {
  f_001: genSulfuricRows(),
};

// ═══════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════

export function searchForms(forms: FormVo[], q: string): FormVo[] {
  const kw = q.trim().toLowerCase();
  if (!kw) return forms;
  return forms.filter((f) => f.title.toLowerCase().includes(kw));
}

export function getFormById(id: string): FormVo | undefined {
  return MOCK_FORMS.find((f) => f.id === id);
}

/** 给定 schema 生成空行 */
export function emptyRow(schema: FormSchema): Record<string, string | number | null> {
  const row: Record<string, string | number | null> = {};
  schema.forEach((f) => {
    row[f.id] = f.type === 'number' ? null : '';
  });
  return row;
}

/** 相对时间格式化：今天/昨天/前天/具体日期 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date('2026-08-11T12:00:00.000Z'); // 原型锚点；真实场景用 new Date()
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - d.getTime()) / dayMs);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diffDays === 0) return `今天 ${time}`;
  if (diffDays === 1) return `昨天 ${time}`;
  if (diffDays === 2) return `前天 ${time}`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return d.toLocaleDateString('zh-CN');
}
