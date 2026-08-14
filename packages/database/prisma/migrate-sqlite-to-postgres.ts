import { PrismaClient as SqlitePrismaClient } from '@prisma/client';
import { PrismaClient as PostgresPrismaClient } from '../generated/postgres-client';

process.env.DATABASE_URL ??= 'file:./dev.db';

const sqlite = new SqlitePrismaClient();
const postgres = new PostgresPrismaClient();

async function main() {
  if (!process.env.POSTGRES_DATABASE_URL) {
    throw new Error('缺少 POSTGRES_DATABASE_URL，无法导入 PostgreSQL');
  }

  console.log('\n  ── 开始从 SQLite 导入 PostgreSQL ──\n');

  const [users, forms, submissions] = await Promise.all([
    sqlite.user.findMany({ orderBy: { createdAt: 'asc' } }),
    sqlite.form.findMany({ orderBy: { createdAt: 'asc' } }),
    sqlite.formSubmission.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  for (const user of users) {
    await postgres.user.upsert({
      where: { id: user.id },
      update: {
        phone: user.phone,
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      create: { ...user },
    });
  }

  for (const form of forms) {
    await postgres.form.upsert({
      where: { id: form.id },
      update: {
        title: form.title,
        description: form.description,
        schema: form.schema,
        status: form.status,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      },
      create: { ...form },
    });
  }

  for (const submission of submissions) {
    await postgres.formSubmission.upsert({
      where: { id: submission.id },
      update: {
        formId: submission.formId,
        data: submission.data,
        submitterIp: submission.submitterIp,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      },
      create: { ...submission },
    });
  }

  console.log(`  ✓  用户 ${users.length} 条`);
  console.log(`  ✓  表单 ${forms.length} 条`);
  console.log(`  ✓  提交记录 ${submissions.length} 条`);
  console.log('\n  ── SQLite 导入 PostgreSQL 完成 ──\n');
}

main()
  .catch((error) => {
    console.error('  ✗  SQLite 导入 PostgreSQL 失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  });
