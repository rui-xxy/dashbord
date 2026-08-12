import type { Form as DbForm, FormSubmission as DbSubmission } from '@prisma/client';
import type { FormVo, FormSubmissionVo, FormSchema, SubmissionData } from '@hgbord/shared';

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Prisma Form → FormVo（带 collected 计数；collected 由 service 关联查询注入） */
export function toFormVo(
  f: DbForm & { _count?: { submissions: number } },
): FormVo {
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    schema: parseJson<FormSchema>(f.schema, []),
    status: f.status,
    collected: f._count?.submissions ?? 0,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

/** Prisma FormSubmission → FormSubmissionVo */
export function toSubmissionVo(s: DbSubmission): FormSubmissionVo {
  return {
    id: s.id,
    formId: s.formId,
    data: parseJson<SubmissionData>(s.data, {}),
    submitterIp: s.submitterIp,
    createdAt: s.createdAt.toISOString(),
  };
}
