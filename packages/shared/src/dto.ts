import { z } from 'zod';
import { Role, UserStatus } from './enums';

// ═══════════════════════════════════════════════════════════
// 手机号校验（中国大陆 11 位）
// ═══════════════════════════════════════════════════════════

/** 中国大陆手机号：1 开头，第二位 3-9，共 11 位 */
export const PHONE_REGEX = /^1[3-9]\d{9}$/;

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, '请输入正确的手机号（11 位）');

// ═══════════════════════════════════════════════════════════
// 认证 DTO
// ═══════════════════════════════════════════════════════════

export const LoginDto = z.object({
  phone: phoneSchema,
  password: z.string().min(1, '请输入密码'),
});
export type LoginDto = z.infer<typeof LoginDto>;

export const TokenPair = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type TokenPair = z.infer<typeof TokenPair>;

// ═══════════════════════════════════════════════════════════
// 用户 DTO
// ═══════════════════════════════════════════════════════════

/** 对外的用户对象（永远不含 passwordHash） */
export const UserVo = z.object({
  id: z.string(),
  phone: z.string(),
  name: z.string(),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(UserStatus),
  avatarUrl: z.string().nullable(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserVo = z.infer<typeof UserVo>;

export const CreateUserDto = z.object({
  phone: phoneSchema,
  name: z.string().min(2, '姓名至少 2 个字符').max(20, '姓名最多 20 个字符'),
  password: z.string().min(6, '密码至少 6 位').max(72, '密码最多 72 位'),
  role: z.nativeEnum(Role).default(Role.STAFF),
});
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = z.object({
  name: z.string().min(2).max(20).optional(),
  phone: phoneSchema.optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

export const UpdateUserRoleDto = z.object({
  role: z.nativeEnum(Role),
});
export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleDto>;

export const UpdateUserStatusDto = z.object({
  status: z.nativeEnum(UserStatus),
});
export type UpdateUserStatusDto = z.infer<typeof UpdateUserStatusDto>;

// ═══════════════════════════════════════════════════════════
// 分页
// ═══════════════════════════════════════════════════════════

export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;

export const Paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

export const PaginatedUserVo = Paginated(UserVo);
export type PaginatedUserVo = z.infer<typeof PaginatedUserVo>;

// ═══════════════════════════════════════════════════════════
// 表单 —— 动态 Schema（FormField[] + JSON data）
// 字段定义与前端 forms-data.ts 保持一致，前后端共用类型
// ═══════════════════════════════════════════════════════════

/** 字段类型 */
export const FieldType = z.enum(['text', 'number', 'date', 'select']);
export type FieldType = z.infer<typeof FieldType>;

/** select 选项 */
export const FieldOption = z.object({
  label: z.string(),
  value: z.string(),
});
export type FieldOption = z.infer<typeof FieldOption>;

/** 单个字段定义 —— 描述表单的一列 */
export const FormField = z.object({
  id: z.string(),
  title: z.string(),
  type: FieldType,
  group: z.string().optional(),
  options: z.array(FieldOption).optional(),
  precision: z.number().optional(),
  unit: z.string().optional(),
  width: z.number().optional(),
});
export type FormField = z.infer<typeof FormField>;

/** 表单字段集合（顺序即列顺序） */
export const FormSchema = z.array(FormField);
export type FormSchema = z.infer<typeof FormSchema>;

/** 提交记录里的一行数据 —— key 是 field.id */
export const SubmissionData = z.record(z.string(), z.union([z.string(), z.number(), z.null()]));
export type SubmissionData = z.infer<typeof SubmissionData>;

/** 表单状态 */
export const FormStatus = z.enum(['draft', 'published', 'closed']);
export type FormStatus = z.infer<typeof FormStatus>;

// ── Form VO ──
export const FormVo = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  schema: FormSchema,
  status: z.string(),
  /** 已收集份数（后端按 submissions 关联计数） */
  collected: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FormVo = z.infer<typeof FormVo>;

// ── Form 提交记录 VO ──
export const FormSubmissionVo = z.object({
  id: z.string(),
  formId: z.string(),
  data: SubmissionData,
  submitterIp: z.string().nullable(),
  createdAt: z.string(),
});
export type FormSubmissionVo = z.infer<typeof FormSubmissionVo>;

// ── Form CRUD DTO ──
export const CreateFormDto = z.object({
  title: z.string().min(1, '请输入表单标题').max(60, '标题最多 60 字'),
  description: z.string().max(200).optional(),
  schema: FormSchema.optional(),
});
export type CreateFormDto = z.infer<typeof CreateFormDto>;

export const UpdateFormDto = z.object({
  title: z.string().min(1).max(60).optional(),
  description: z.string().max(200).nullable().optional(),
  schema: FormSchema.optional(),
  status: FormStatus.optional(),
});
export type UpdateFormDto = z.infer<typeof UpdateFormDto>;

// ── Form 提交 DTO ──
export const CreateSubmissionDto = z.object({
  data: SubmissionData,
});
export type CreateSubmissionDto = z.infer<typeof CreateSubmissionDto>;

export const UpdateSubmissionDto = z.object({
  data: SubmissionData,
});
export type UpdateSubmissionDto = z.infer<typeof UpdateSubmissionDto>;

/** 批量保存（DataSheet 保存按钮用） */
export const BatchUpdateSubmissionsDto = z.object({
  created: z.array(CreateSubmissionDto).optional(),
  updated: z
    .array(
      z.object({
        id: z.string(),
        data: SubmissionData,
      }),
    )
    .optional(),
  deleted: z.array(z.string()).optional(),
});
export type BatchUpdateSubmissionsDto = z.infer<typeof BatchUpdateSubmissionsDto>;

// ── Form 分页查询 ──
export const FormPaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type FormPaginationQuery = z.infer<typeof FormPaginationQuery>;

export const PaginatedFormVo = Paginated(FormVo);
export type PaginatedFormVo = z.infer<typeof PaginatedFormVo>;

export const PaginatedFormSubmissionVo = Paginated(FormSubmissionVo);
export type PaginatedFormSubmissionVo = z.infer<typeof PaginatedFormSubmissionVo>;
