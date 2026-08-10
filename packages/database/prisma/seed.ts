/**
 * 种子脚本 —— 创建超级管理员账号
 *
 * 幂等：若手机号已存在则跳过，不会报错也不会覆盖密码。
 *
 * 从根目录运行：pnpm db:seed
 * 需要的环境变量（默认值见 .env.example）：
 *   SEED_ADMIN_PHONE
 *   SEED_ADMIN_PASSWORD
 *   SEED_ADMIN_NAME
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.SEED_ADMIN_PHONE ?? '18684593792';
  const password = process.env.SEED_ADMIN_PASSWORD ?? '123456';
  const name = process.env.SEED_ADMIN_NAME ?? '超级管理员';

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    console.log(`\n  ℹ  账号已存在，跳过创建: ${phone}`);
    console.log(`     角色: ${existing.role}  状态: ${existing.status}\n`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      phone,
      name,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('\n  ✓  超级管理员账号已创建');
  console.log('  ───────────────────────────────────');
  console.log(`     ID:     ${admin.id}`);
  console.log(`     手机号: ${admin.phone}`);
  console.log(`     姓名:   ${admin.name}`);
  console.log(`     角色:   ${admin.role}`);
  console.log(`     密码:   ${password}  (已 bcrypt 哈希存储)`);
  console.log('  ───────────────────────────────────');
  console.log('  →  打开 http://localhost:3000/login 登录\n');
}

main()
  .catch((e) => {
    console.error('  ✗  seed 失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
