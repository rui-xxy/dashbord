/**
 * 表单管理 —— 前端工具函数
 *
 * 类型定义已迁到 @hgbord/shared（dto.ts）：
 *   FormVo / FormSubmissionVo / FormField / FormSchema / FieldType ...
 *
 * 本文件只保留前端专用的展示工具函数，数据本身走 api.forms.* 真实接口。
 */
import type { FormSchema } from '@hgbord/shared';

export type { FormSchema, FormField, FieldType, FieldOption } from '@hgbord/shared';
export type { FormVo, FormSubmissionVo } from '@hgbord/shared';

/** 从 @hgbord/shared 的 FormSubmissionVo 转成本组件用的格式（data 兼容） */
export interface DisplaySubmission {
  id: string;
  data: Record<string, string | number | null>;
  createdAt: string;
}

/** 相对时间格式化：今天/昨天/前天/具体日期 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor((now.getTime() - d.getTime()) / dayMs);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diffDays === 0) return `今天 ${time}`;
  if (diffDays === 1) return `昨天 ${time}`;
  if (diffDays === 2) return `前天 ${time}`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return d.toLocaleDateString('zh-CN');
}

/** 给定 schema 生成空行（DataSheet 新增行用） */
export function emptyRow(schema: FormSchema): Record<string, string | number | null> {
  const row: Record<string, string | number | null> = {};
  schema.forEach((f) => {
    row[f.id] = f.type === 'number' ? null : '';
  });
  return row;
}
