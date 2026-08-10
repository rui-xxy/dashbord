# hgbord

真实可运行的后台框架 —— Monorepo + 权限系统 + 用户管理。

## 技术栈

| 层 | 技术 |
|----|------|
| 数据库 | SQLite（原型阶段，零配置；后续可迁 PostgreSQL） |
| 后端 | NestJS 10 + Prisma 5 + JWT + bcrypt |
| 前端 | Next.js 14 (App Router) + shadcn/ui (Radix) + Tailwind + TanStack Query |
| 共享 | `packages/shared`（权限矩阵/DTO）+ `packages/database`（Prisma schema） |
| 包管理 | pnpm workspaces |

## 目录结构

```
hgbord/
├── apps/
│   ├── admin/              # Next.js 后台前端（端口 3000）
│   └── api/                # NestJS 后端（端口 4000）
├── packages/
│   ├── shared/             # 前后端共享：角色/权限/DTO
│   └── database/           # Prisma schema + seed
├── docs/                   # 设计文档
├── prototype/              # 早期 HTML 视觉原型
└── package.json
```

## 快速启动

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建共享包

```bash
pnpm build:packages
```

> 共享包（shared/database）是 TypeScript 源码，需要先编译成 CJS 供 apps 消费。改了 `packages/shared` 或 `packages/database/src` 后重新跑这一步。

### 3. 初始化数据库 + 你的账号

```bash
cd packages/database
DATABASE_URL="file:./dev.db" npx prisma db push --schema=./prisma/schema.prisma --skip-generate
DATABASE_URL="file:./dev.db" npx tsx prisma/seed.ts
cd ../..
```

这会创建你的超级管理员账号：
- 手机号：`18684593792`
- 密码：`123456`

### 4. 启动开发服务器

开两个终端：

```bash
# 终端 1：后端（端口 4000）
cd apps/api
DATABASE_URL="file:../../packages/database/prisma/dev.db" \
API_PORT=4000 \
JWT_ACCESS_SECRET=dev-access-secret-32-chars-min!! \
JWT_REFRESH_SECRET=dev-refresh-secret-32-chars-min!! \
npx tsc-watch --onSuccess "node dist/main.js"
```

```bash
# 终端 2：前端（端口 3000）
cd apps/admin
NEXT_PUBLIC_API_URL=http://localhost:4000 npx next dev -p 3000
```

打开 http://localhost:3000/login → 用上面的账号登录。

## 权限系统

### 4 级角色

| 角色 | 定位 |
|------|------|
| `SUPER_ADMIN` | 超级管理员。拥有一切权限，系统至少保留 1 个 |
| `ADMIN` | 管理员。管理用户和内容，不能改其他管理员 |
| `MANAGER` | 经理。查看数据，不能管理用户 |
| `STAFF` | 员工。只能查看自己的数据 |

### 安全规则（后端守卫强制）

1. 超级管理员不可被删除，系统至少保留 1 个
2. 低层级不能操作高层级（ADMIN 不能改 SUPER_ADMIN）
3. 只有 SUPER_ADMIN 能分配 ADMIN 及以上角色
4. 停用的用户登录被拒
5. 不能停用/删除自己

### 改权限矩阵

权限点定义在 `packages/shared/src/permissions.ts` 的 `ROLE_PERMISSIONS`，前后端共用。改一处，两端同步（需重新 `pnpm build:packages`）。

## API 端点

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 无 | 登录 |
| POST | `/api/auth/refresh` | refresh token | 刷新 |
| GET | `/api/auth/me` | JWT | 当前用户 |
| GET | `/api/users` | USER_VIEW | 用户列表（分页/搜索/筛选） |
| POST | `/api/users` | USER_CREATE | 创建 |
| PATCH | `/api/users/:id` | USER_UPDATE | 编辑资料 |
| PATCH | `/api/users/:id/role` | USER_UPDATE_ROLE | 改角色（仅超管） |
| PATCH | `/api/users/:id/status` | USER_UPDATE_STATUS | 停用/启用 |
| DELETE | `/api/users/:id` | USER_DELETE | 删除（仅超管） |

## 迁移到 PostgreSQL

后续装了 Docker 或有 PG 实例时：

1. 改 `packages/database/prisma/schema.prisma`：`provider = "postgresql"`
2. 改 `DATABASE_URL` 为 `postgresql://user:pass@host:5432/db`
3. `cd packages/database && npx prisma migrate reset --schema=./prisma/schema.prisma --force`
4. 重新 seed

## 后续待做

- [ ] 表单管理（目前是占位页）
- [ ] 用户前端（apps/web）
- [ ] Redis（会话/限流）
- [ ] 对象存储（头像/附件）
- [ ] 测试
- [ ] 部署
