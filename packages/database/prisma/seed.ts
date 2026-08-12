/**
 * 种子脚本 —— 创建超级管理员 + 硫酸车间报表（含 30 天填报数据）
 *
 * 幂等：
 * - 管理员：若手机号已存在则跳过
 * - 表单：若标题已存在则跳过表单创建，但会补齐缺失的提交记录
 *
 * 运行：pnpm db:seed（从 packages/database 目录，prisma/.env 提供连接串）
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function stringifyJson(value: unknown) {
  return JSON.stringify(value);
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ═══════════════════════════════════════════════════════════
// 硫酸车间报表 Schema —— 对齐 b2-source form 6 真实字段
// ═══════════════════════════════════════════════════════════
// 数据来源：dashboard-b2-source/.../all_forms_debug.json (form id=6)
// 字段标题沿用真实填报用的储罐编号/名称（2#/3#/拨酸槽 等）
// ═══════════════════════════════════════════════════════════

const SULFURIC_SCHEMA = [
  // ── 基础（日期隐藏，提交时自动填今天，对齐原版 layout.hidden:true）──
  { id: 'field_date', title: '日期', type: 'date', group: '基础', hidden: true, required: true, placeholder: '请选择日期', description: '数据归属日期' },

  // ── 98%硫酸 储罐液位（%）──
  { id: 'tank_98-1', title: '2#', type: 'number', group: '98%硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 98酸', width: 70 },
  { id: 'tank_98-2', title: '3#', type: 'number', group: '98%硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 98酸', width: 70 },
  { id: 'tank_98-3', title: '4#', type: 'number', group: '98%硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 98酸', width: 70 },
  { id: 'tank_98-4', title: '拨酸槽', type: 'number', group: '98%硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 98酸', width: 80 },

  // ── 发烟硫酸 储罐液位（%）──
  { id: 'tank_fy-1', title: '1#', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 发烟硫酸', width: 70 },
  { id: 'tank_fy-2', title: '5#', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 发烟硫酸', width: 70 },
  { id: 'tank_fy-3', title: '烟酸拨酸槽', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 发烟硫酸', width: 90 },
  { id: 'tank_fy-4', title: '氨基磺酸转运槽', type: 'number', group: '发烟硫酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 发烟硫酸', width: 110 },

  // ── 试剂酸 储罐液位（%）──
  { id: 'tank_jp-1', title: '1#', type: 'number', group: '试剂酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 试剂酸', width: 70 },
  { id: 'tank_jp-2', title: '2#', type: 'number', group: '试剂酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 试剂酸', width: 70 },
  { id: 'tank_jp-3', title: '3#', type: 'number', group: '试剂酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 试剂酸', width: 70 },
  { id: 'tank_jp-4', title: '4#', type: 'number', group: '试剂酸', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 试剂酸', width: 70 },

  // ── 其他储罐 ──
  { id: 'tank_syc-1', title: '双氧水储罐', type: 'number', group: '其他储罐', precision: 1, unit: '%', suffix: '%', min: 0, max: 100, step: 0.1, placeholder: '请输入液位', description: '物料: 双氧水', width: 100 },

  // ── 仪表读数（电表度数）──
  { id: 'meter_3', title: '1#电机', type: 'number', group: '仪表读数', precision: 2, suffix: '千瓦时', min: 0, step: 0.01, placeholder: '请输入读数', description: '类型: 电表', width: 80 },
  { id: 'meter_4', title: '2#电机', type: 'number', group: '仪表读数', precision: 2, suffix: '千瓦时', min: 0, step: 0.01, placeholder: '请输入读数', description: '类型: 电表', width: 80 },
  { id: 'meter_5', title: '1#电炉', type: 'number', group: '仪表读数', precision: 2, suffix: '千瓦时', min: 0, step: 0.01, placeholder: '请输入读数', description: '类型: 电表', width: 80 },
  { id: 'meter_6', title: '2#电炉', type: 'number', group: '仪表读数', precision: 2, suffix: '千瓦时', min: 0, step: 0.01, placeholder: '请输入读数', description: '类型: 电表', width: 80 },
  { id: 'meter_mgso4_phase2', title: '硫酸镁二期电表', type: 'number', group: '仪表读数', precision: 2, suffix: '千瓦时', min: 0, step: 0.01, placeholder: '请输入读数', description: '类型: 电表', width: 120 },
  { id: 'meter_amino', title: '氨基磺酸电表', type: 'number', group: '仪表读数', precision: 2, suffix: '千瓦时', min: 0, step: 0.01, placeholder: '请输入读数', description: '类型: 电表', width: 110 },
];

// ═══════════════════════════════════════════════════════════
// 数据生成器 —— 30 天真实量级填报数据
// ═══════════════════════════════════════════════════════════

/** 储罐液位：50~95% 之间波动，缓慢变化（邻日差异不大） */
function level(base: number, dayIdx: number, variance: number): number {
  const v = base + Math.sin(dayIdx / 5) * variance + (Math.random() - 0.5) * 4;
  return Number(Math.max(20, Math.min(98, v)).toFixed(1));
}

/** 电表读数：4 位数度数，逐日累积（读数只能增不能回退，模拟电表性质） */
function meterReading(base: number, dayIdx: number, dailyRate: number): number {
  return Number(base + dayIdx * dailyRate + (Math.random() - 0.5) * dailyRate * 0.4).toFixed(2);
}

/** 偶尔生成停车记录 */
function parkingForDay(dayIdx: number): string {
  // dayIdx=3 和 dayIdx=18 各一条停车记录
  if (dayIdx === 3) return '10:00~11:30 1#锅炉换管';
  if (dayIdx === 18) return '14:00~15:00 检修结束恢复';
  return '';
}

function genSubmissionData(dayIdx: number): Record<string, string | number | null> {
  const d = new Date();
  d.setDate(d.getDate() - dayIdx);
  const dateStr = d.toISOString().slice(0, 10);

  return {
    field_date: dateStr,
    'tank_98-1': level(82, dayIdx, 6),
    'tank_98-2': level(75, dayIdx, 5),
    'tank_98-3': level(68, dayIdx, 7),
    'tank_98-4': level(88, dayIdx, 4),
    'tank_fy-1': level(70, dayIdx, 8),
    'tank_fy-2': level(65, dayIdx, 6),
    'tank_fy-3': level(72, dayIdx, 5),
    'tank_fy-4': level(80, dayIdx, 7),
    'tank_jp-1': level(55, dayIdx, 9),
    'tank_jp-2': level(62, dayIdx, 6),
    'tank_jp-3': level(48, dayIdx, 8),
    'tank_jp-4': level(70, dayIdx, 5),
    'tank_syc-1': level(78, dayIdx, 6),
    meter_3: meterReading(12480, dayIdx, 320),
    meter_4: meterReading(9820, dayIdx, 240),
    meter_5: meterReading(4560, dayIdx, 110),
    meter_6: meterReading(3120, dayIdx, 85),
    meter_mgso4_phase2: meterReading(2840, dayIdx, 70),
    meter_amino: meterReading(1560, dayIdx, 42),
    parkingRecords: parkingForDay(dayIdx),
  };
}

// ═══════════════════════════════════════════════════════════
// 主流程
// ═══════════════════════════════════════════════════════════

async function seedAdmin() {
  const phone = process.env.SEED_ADMIN_PHONE ?? '18684593792';
  const password = process.env.SEED_ADMIN_PASSWORD ?? '123456';
  const name = process.env.SEED_ADMIN_NAME ?? '超级管理员';

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    console.log(`  ℹ  管理员已存在，跳过: ${phone}`);
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { phone, name, passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
  });
  console.log(`  ✓  管理员已创建: ${phone} / ${password}`);
}

async function seedSulfuricForm() {
  const title = '硫酸车间报表';

  // 表单幂等：按 title 查；已存在则更新 schema（保证 seed 改动生效）
  let form = await prisma.form.findFirst({ where: { title } });
  if (!form) {
    form = await prisma.form.create({
      data: {
        title,
        description: '每日生产数据填报',
        schema: stringifyJson(SULFURIC_SCHEMA),
        status: 'published',
      },
    });
    console.log(`  ✓  表单已创建: ${form.id} (${title})`);
  } else {
    form = await prisma.form.update({
      where: { id: form.id },
      data: { schema: stringifyJson(SULFURIC_SCHEMA), description: '每日生产数据填报' },
    });
    console.log(`  ✓  表单 schema 已更新: ${form.id}`);
  }

  // 补齐 30 天提交记录 —— 按 field_date 去重
  const existingDates = new Set(
    (
      await prisma.formSubmission.findMany({
        where: { formId: form.id },
        select: { data: true },
      })
    )
      .map((s) => parseJson<Record<string, unknown>>(s.data, {}).field_date as string)
      .filter(Boolean),
  );

  const DAYS = 30;
  const toCreate: Array<{ formId: string; data: string; createdAt: Date }> = [];
  for (let i = 0; i < DAYS; i++) {
    const data = genSubmissionData(i);
    const dateStr = data.field_date as string;
    if (existingDates.has(dateStr)) continue;
    // createdAt 也按日期回填，方便按时间排序
    const created = new Date();
    created.setDate(created.getDate() - i);
    created.setHours(18, 30, 0, 0);
    toCreate.push({ formId: form.id, data: stringifyJson(data), createdAt: created });
  }

  if (toCreate.length > 0) {
    await prisma.formSubmission.createMany({ data: toCreate });
    console.log(`  ✓  提交记录新增 ${toCreate.length} 条（${DAYS} 天范围）`);
  } else {
    console.log(`  ℹ  提交记录已完整（${DAYS} 天），跳过`);
  }
}

async function main() {
  console.log('\n  ── hgbord seed 开始 ──\n');
  await seedAdmin();
  await seedSulfuricForm();
  console.log('\n  ── seed 完成 ──\n');
}

main()
  .catch((e) => {
    console.error('  ✗  seed 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
