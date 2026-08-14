import { PrismaClient } from '@prisma/client';
import { renameSchemaFieldIds, renameSubmissionKeys } from './field-id-map';

process.env.DATABASE_URL ??= 'file:./dev.db';

const prisma = new PrismaClient();

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value);
}

async function main() {
  console.log('\n  ── 开始重命名历史字段 ID ──\n');

  const forms = await prisma.form.findMany({
    select: {
      id: true,
      title: true,
      schema: true,
      submissions: {
        select: {
          id: true,
          data: true,
        },
      },
    },
  });

  let updatedForms = 0;
  let updatedSubmissions = 0;

  for (const form of forms) {
    const rawSchema = parseJson<Array<Record<string, unknown>>>(form.schema, []);
    const nextSchema = renameSchemaFieldIds(
      rawSchema.filter((field): field is Record<string, unknown> & { id: string } => typeof field?.id === 'string'),
    );

    if (stringifyJson(rawSchema) !== stringifyJson(nextSchema)) {
      await prisma.form.update({
        where: { id: form.id },
        data: { schema: stringifyJson(nextSchema) },
      });
      updatedForms += 1;
      console.log(`  ✓  已更新表单 schema: ${form.title}`);
    }

    for (const submission of form.submissions) {
      const rawData = parseJson<Record<string, unknown>>(submission.data, {});
      const nextData = renameSubmissionKeys(rawData);

      if (stringifyJson(rawData) === stringifyJson(nextData)) continue;

      await prisma.formSubmission.update({
        where: { id: submission.id },
        data: { data: stringifyJson(nextData) },
      });
      updatedSubmissions += 1;
    }
  }

  console.log(`\n  ✓  schema 更新 ${updatedForms} 个，提交记录更新 ${updatedSubmissions} 条`);
  console.log('\n  ── 历史字段 ID 重命名完成 ──\n');
}

main()
  .catch((error) => {
    console.error('  ✗  字段 ID 重命名失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
