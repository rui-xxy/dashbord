# hgbord Monorepo 技术方案

> 本文档是 hgbord 项目的 Monorepo 架构设计方案，目标是"可直接据此动手搭建"的实施级方案。
>
> - **项目类型**：SaaS / Web 应用
> - **技术栈**：TypeScript 全栈
> - **三端结构**：用户前端 (web) + 管理后台 (admin) + 后端 API (api)
> - **核心依赖**：PostgreSQL + Prisma + Redis + 对象存储
> - **包管理**：纯 pnpm workspaces

---

## 目录

1. [项目概述](#一项目概述)
2. [技术栈选型总览](#二技术栈选型总览)
3. [Monorepo 目录结构](#三monorepo-目录结构)
4. [共享包设计](#四共享包设计packages)
5. [应用设计](#五应用设计apps)
6. [数据库设计](#六数据库设计)
7. [缓存与对象存储](#七缓存与对象存储)
8. [pnpm workspaces 配置](#八pnpm-workspaces-配置)
9. [开发工具链](#九开发工具链)
10. [开发流程](#十开发流程)
11. [后续扩展点](#十一后续扩展点占位)

---

## 一、项目概述

### 1.1 三端定位

| 端 | 目录 | 面向人群 | 主要职责 |
|----|------|----------|----------|
| **web** | `apps/web` | 终端用户 | SaaS 产品的主入口，注重体验、性能、SEO |
| **admin** | `apps/admin` | 内部管理员 | 内容、用户、订单、配置等后台管理 |
| **api** | `apps/api` | 前两端 + 第三方 | 统一业务逻辑、数据持久化、权限校验 |

### 1.2 为什么用 Monorepo

传统多仓库方案下，三端会各自维护一套类型定义、工具函数、UI 组件，导致：

- **API 契约漂移**：后端改了字段，前端类型不同步，运行时才报错。
- **重复造轮子**：日期、金额、校验等工具在多个仓库各写一遍。
- **版本管理混乱**：共享代码要发包或复制粘贴，升级困难。

Monorepo 把三端放进同一个 Git 仓库，通过 **共享包 (packages/\*)** 复用代码，带来：

- ✅ **类型安全端到端**：后端 DTO 用 Zod 定义，前端直接 import 推导出的类型，改一处全端同步。
- ✅ **原子化提交**：一个 PR 同时改后端逻辑 + 前端调用 + 共享类型，可追溯、可回滚。
- ✅ **统一工具链**：一套 ESLint / Prettier / TypeScript 配置，三端一致。
- ✅ **组件复用**：通用 UI 组件 (Button、Card、Modal) 一处维护，两端复用。

---

## 二、技术栈选型总览

### 2.1 总览表

| 层 | 技术 | 选型理由 |
|----|------|----------|
| **前端框架** | Next.js 14 (App Router) | RSC、SSR/SSG、文件路由，社区主流，TS 一等公民 |
| **UI 组件库** | web: shadcn/ui + TailwindCSS<br>admin: Ant Design 5 | shadcn 灵活可控；Antd 适合后台密集表格/表单 |
| **前端状态** | TanStack Query (服务态) + Zustand (客户端态) | 职责清晰，避免状态管理膨胀 |
| **后端框架** | NestJS | 模块化、DI 容器、装饰器风格，工程化成熟 |
| **数据校验** | Zod | runtime 校验 + 静态类型推导一体，前后端共用 |
| **ORM** | Prisma | 类型安全、迁移工具完善、DX 顶级 |
| **数据库** | PostgreSQL | 功能丰富的关系型库，JSONB / 全文索引 / 扩展生态强 |
| **缓存** | Redis (ioredis) | 会话、限流、热点缓存标配 |
| **对象存储** | S3 兼容（MinIO 本地 / 云 OSS 生产） | 接口统一，本地云上一致 |
| **认证** | JWT (Access + Refresh Token) | 无状态、跨服务易扩展 |

### 2.2 语言与运行时

- **语言**：TypeScript（strict 模式），三端统一。
- **Node 版本**：LTS（当前推荐 20.x），通过根 `package.json` 的 `engines` 字段与 `.nvmrc` 锁定。
- **包管理器**：pnpm（通过 `packageManager` 字段锁定版本，启用 Corepack）。

---

## 三、Monorepo 目录结构

```text
hgbord/
├── apps/                          # 应用层：可独立部署的产物
│   ├── web/                       # 用户前端 (Next.js)
│   │   ├── src/
│   │   │   ├── app/               # App Router 路由
│   │   │   ├── components/        # web 专属组件
│   │   │   ├── lib/               # web 专属逻辑（api client 等）
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   └── package.json
│   ├── admin/                     # 管理后台 (Next.js)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/        # admin 专属（表格、表单、权限路由）
│   │   │   └── lib/
│   │   ├── next.config.js
│   │   └── package.json
│   └── api/                       # 后端服务 (NestJS)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── modules/           # 业务模块（user/auth/content/...）
│       │   │   └── user/
│       │   │       ├── user.controller.ts
│       │   │       ├── user.service.ts
│       │   │       └── user.module.ts
│       │   ├── common/            # 过滤器、拦截器、守卫、装饰器
│       │   └── config/            # 配置加载
│       ├── prisma/                # 仅放 seed 脚本（schema 在 packages/database）
│       ├── nest-cli.json
│       └── package.json
├── packages/                      # 共享包：被 apps 依赖
│   ├── shared/                    # @hgbord/shared  DTO 契约 + 枚举 + 常量
│   │   ├── src/
│   │   │   ├── dto/               # Zod schema + 推导类型
│   │   │   ├── enums/
│   │   │   ├── constants/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── database/                  # @hgbord/database  Prisma schema 唯一来源
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # ★ 全局唯一 schema
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── client.ts          # 导出单例 PrismaClient
│   │   │   └── index.ts
│   │   └── package.json
│   ├── ui/                        # @hgbord/ui  跨端通用组件库
│   │   ├── src/
│   │   │   ├── button/
│   │   │   ├── card/
│   │   │   └── index.ts
│   │   └── package.json
│   ├── config/                    # @hgbord/config  工具链预设
│   │   ├── eslint/
│   │   ├── typescript/
│   │   │   └── tsconfig.base.json
│   │   └── package.json
│   └── utils/                     # @hgbord/utils  纯函数工具
│       ├── src/
│       │   ├── date.ts
│       │   ├── currency.ts
│       │   └── validate.ts
│       └── package.json
├── docker/                        # 本地开发基础设施
│   └── docker-compose.yml         # postgres + redis + minio
├── docs/                          # 项目文档
│   └── monorepo-design.md         # 本文件
├── .github/                       # CI/CD（后续扩展）
├── .husky/                        # Git hooks
├── .changeset/                    # 变更日志（可选）
├── .nvmrc
├── .editorconfig
├── .env.example
├── .gitignore
├── package.json                   # 根 package.json（脚本编排）
├── pnpm-workspace.yaml            # ★ workspace 声明
├── tsconfig.base.json             # ★ 全局 TS 基础配置
└── README.md
```

### 3.1 核心原则

1. **apps/ 只放可部署产物**：每个 app 都能独立 build、独立运行。
2. **packages/ 只放可复用代码**：不依赖具体 app，可被多个 app 引用。
3. **schema 单一来源**：Prisma schema 只存在于 `packages/database`，任何端要访问数据库都通过 `@hgbord/database`，避免 schema 漂移。
4. **配置集中**：ESLint / tsconfig / Tailwind 预设放 `packages/config`，各端继承，不重复维护。

---

## 四、共享包设计（packages/*）

### 4.1 `@hgbord/shared` —— 类型契约中心

**职责**：定义前后端共享的数据契约，是 Monorepo 的"粘合剂"。

**核心导出**：

```ts
// packages/shared/src/dto/user.ts
import { z } from 'zod';

// Zod schema = runtime 校验 + 类型推导的唯一来源
export const CreateUserDto = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(20),
  password: z.string().min(8),
});

// 类型由 schema 推导，保证 schema 与类型永不分离
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UserVo = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  createdAt: z.string(),
});
export type UserVo = z.infer<typeof UserVo>;
```

**消费方式**：

- **api 端**：`CreateUserDto.parse(body)` 做 runtime 校验，类型自动匹配 controller。
- **web / admin 端**：`type CreateUserDto` 用于表单类型，`UserVo` 用于渲染。

**其他导出**：

```ts
// enums/role.ts
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

// constants/error-codes.ts
export const ErrorCode = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
} as const;
```

> **关键收益**：改一处 schema，三端类型、校验、文档全部同步，彻底消除契约漂移。

### 4.2 `@hgbord/database` —— 数据访问唯一入口

**职责**：集中管理 Prisma schema、迁移、client 单例。

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  // 关键：让生成的 client 输出到包内，而不是 node_modules
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== 用户域 =====
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

```ts
// packages/database/src/client.ts
import { PrismaClient } from '@prisma/client';

// 全局单例，避免开发模式热重载时建立过多连接
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**消费方式**：api 端通过 `import { prisma } from '@hgbord/database'` 访问；web/admin **不直接访问数据库**，一律走 API。

### 4.3 `@hgbord/ui` —— 跨端通用组件库

**职责**：剥离 web 与 admin 都会用的展示型组件，避免重复。

- 典型组件：`Button`、`Card`、`Modal`、`Badge`、`Avatar`、`Empty`。
- 基于 **shadcn/ui 风格**（Radix UI + TailwindCSS），可控且不锁版本。
- 通过 `packages/ui/src/index.ts` 桶导出，两端 `import { Button } from '@hgbord/ui'`。

> **注意**：admin 专属的重型表格/表单（如 ProTable、ProForm）仍用 Ant Design，放在 `apps/admin` 内部，不进 ui 包。

### 4.4 `@hgbord/config` —— 工具链预设

**职责**：集中 ESLint / TypeScript / Tailwind / Prettier 配置，各端继承。

```js
// packages/config/eslint/index.js
module.exports = {
  extends: ['next', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
  },
};

// packages/config/typescript/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

各端 `tsconfig.json` 只需 `extends`：

```json
// apps/web/tsconfig.json
{
  "extends": "@hgbord/config/typescript/tsconfig.base.json",
  "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } },
  "include": ["src", "next-env.d.ts"]
}
```

### 4.5 `@hgbord/utils` —— 纯函数工具

**职责**：无副作用、无 I/O、易测试的纯函数。

- `date.ts`：格式化、相对时间、时区转换。
- `currency.ts`：金额格式化（分 ↔ 元、千分位）。
- `validate.ts`：手机号、身份证、URL 等格式校验。
- `slug.ts`：标题转 slug。

```ts
// packages/utils/src/currency.ts
export function fenToYuan(fen: number): string {
  return (fen / 100).toFixed(2);
}
```

### 4.6 共享包依赖关系图

```text
        ┌───────────────┐
        │  @hgbord/shared │ ← 纯类型/Zod，零运行时依赖
        └───────┬───────┘
                │ 被依赖
   ┌────────────┼────────────┐
   ▼            ▼            ▼
 apps/web   apps/admin   apps/api
   │            │            │
   │            │            │ @hgbord/database (api 独占)
   │            │            │ @hgbord/utils (三端共享)
   └────────────┴────────────┘
            @hgbord/ui (web/admin 共享)
```

---

## 五、应用设计（apps/*）

### 5.1 `apps/web` —— 用户前端

- **框架**：Next.js 14 App Router。
- **渲染策略**：营销页 / 文档页用 SSG，需要登录的页面用 SSR + Cookie 鉴权，列表页用 SSR + 客户端 TanStack Query 翻页。
- **路由结构**：

  ```text
  app/
  ├── (marketing)/         # 落地页、定价（公开，SSG）
  │   ├── page.tsx
  │   └── pricing/
  ├── (auth)/              # 登录注册
  │   ├── login/
  │   └── register/
  └── (app)/               # 登录后主应用
      ├── dashboard/
      └── settings/
  ```

- **数据获取**：统一 `lib/api-client.ts` 封装 fetch，类型来自 `@hgbord/shared`。

### 5.2 `apps/admin` —— 管理后台

- **框架**：Next.js 14 App Router + Ant Design 5（ProComponents）。
- **特点**：以 CRUD 表格、复杂表单、图表为主，权限路由守卫。
- **路由结构**：

  ```text
  app/
  ├── login/
  └── (admin)/             # 中间件校验 ADMIN 角色后才能进入
      ├── users/           # 用户管理
      ├── content/         # 内容审核
      └── analytics/       # 数据看板
  ```

- **权限**：`middleware.ts` 校验 JWT，非 ADMIN 重定向到登录页。
- **部署**：独立子域名（如 `admin.hgbord.com`），与用户站隔离。

### 5.3 `apps/api` —— 后端服务

- **框架**：NestJS。
- **结构**：模块化（每个业务域一个 module），统一基础设施层。

  ```text
  src/
  ├── main.ts
  ├── app.module.ts
  ├── modules/
  │   ├── auth/            # 登录、注册、刷新 token
  │   ├── user/
  │   ├── content/
  │   └── upload/          # 文件上传（对接对象存储）
  └── common/
      ├── filters/         # 全局异常过滤器（统一错误响应格式）
      ├── interceptors/    # 响应拦截器（统一 { code, data, message }）
      ├── guards/          # JWT Guard、Role Guard
      ├── decorators/      # @CurrentUser()、@Roles()
      └── pipes/           # ZodValidationPipe（用 @hgbord/shared 的 schema）
  ```

- **统一响应格式**：

  ```ts
  // 所有成功响应统一包装
  {
    "code": 0,
    "data": { ... },
    "message": "ok"
  }
  // 错误响应
  {
    "code": "USER_NOT_FOUND",
    "data": null,
    "message": "用户不存在"
  }
  ```

- **认证流程**（JWT + Refresh）：
  1. 登录成功签发 `accessToken`（短，15min）+ `refreshToken`（长，7d，存 Redis）。
  2. accessToken 过期 → 前端用 refreshToken 调 `/auth/refresh` 换新。
  3. refreshToken 黑名单存 Redis，登出时拉黑。
- **预留**：对外 REST 为主，后续可加 GraphQL 模块。

---

## 六、数据库设计

### 6.1 单一 schema 原则

整个 Monorepo 只有 **一个** `schema.prisma`，位于 `packages/database/prisma/`。这是防止多端 schema 漂移的核心约束。

**严禁**在 `apps/*` 内自行创建 Prisma schema 或绕过 `@hgbord/database` 直接连库。

### 6.2 多应用共享同一 schema 的边界划分

一个 schema 服务多个应用，用注释分区保持清晰：

```prisma
// ═══════════════════════════════════════
// 用户域（auth/admin 共用）
// ═══════════════════════════════════════
model User { ... }
model Session { ... }

// ═══════════════════════════════════════
// 内容域（web/admin 共用）
// ═══════════════════════════════════════
model Article { ... }
model Category { ... }

// ═══════════════════════════════════════
// 订单域（web/admin 共用）
// ═══════════════════════════════════════
model Order { ... }
model Payment { ... }
```

不同应用只读写各自关心的 model，但物理上是同一个库。

### 6.3 迁移流程

```bash
# 1. 改 schema.prisma
# 2. 生成迁移并应用到本地库
pnpm --filter @hgbord/database prisma:migrate dev --name add_user_avatar

# 3. 仅同步 schema 不生成迁移（开发期临时调试）
pnpm --filter @hgbord/database prisma:push

# 4. 重置本地库（慎用，仅开发期）
pnpm --filter @hgbord/database prisma:migrate reset

# 5. 生产部署时应用已有迁移（不交互）
pnpm --filter @hgbord/database prisma:migrate deploy
```

迁移文件 `packages/database/prisma/migrations/` **必须提交到 Git**，保证团队和生产环境 schema 一致。

### 6.4 环境隔离

| 环境 | 库 | 说明 |
|------|----|----|
| dev | 本地 Docker PostgreSQL | 开发期，可随时 reset |
| staging | 独立测试库 | 预发布验证 |
| prod | 生产库 | 迁移必须用 `migrate deploy`，禁用 reset |

通过各环境的 `DATABASE_URL` 环境变量区分。

### 6.5 Prisma Client 生成与打包注意

- `postinstall` 钩子：`@hgbord/database` 安装后自动 `prisma generate`。
- 多 app 共用同一份生成的 client，避免每个 app 各生成一份造成版本错乱。
- Next.js 端如需用到 Prisma 类型（仅类型，不连库），通过 `@hgbord/database` 的类型导出获取。

---

## 七、缓存与对象存储

### 7.1 Redis

**封装位置**：`apps/api` 内的 `CacheModule`，对外暴露 `RedisService`。

```ts
// apps/api/src/common/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_KEY = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS_KEY,
      useFactory: () =>
        new Redis(process.env.REDIS_URL!, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        }),
    },
    {
      provide: 'RedisService',
      useExisting: REDIS_KEY,
    },
  ],
  exports: [REDIS_KEY],
})
export class CacheModule {}
```

**典型用例**：

| 场景 | Key 设计 | TTL |
|------|----------|-----|
| 登录限流 | `ratelimit:login:{ip}` 计数 | 15min |
| 邮箱验证码 | `vcode:{email}` | 5min |
| Refresh Token 黑名单 | `blacklist:rt:{jti}` | = token 剩余有效期 |
| 配置缓存 | `config:global` | 1h，写操作主动失效 |
| 热点列表 | `hot:articles` | 10min |

### 7.2 对象存储

**设计目标**：本地用 MinIO，生产用阿里云 OSS / AWS S3，**只改环境变量不改代码**。

**统一接口**（放在 api 端）：

```ts
// apps/api/src/modules/storage/storage.interface.ts
export interface IStorageService {
  /** 上传文件，返回对象 key */
  upload(bucket: string, key: string, body: Buffer, contentType: string): Promise<void>;

  /** 生成预签名下载 URL */
  getSignedUrl(bucket: string, key: string, expiresInSeconds?: number): Promise<string>;

  /** 删除对象 */
  delete(bucket: string, key: string): Promise<void>;
}
```

**S3 兼容实现**（MinIO / OSS / AWS S3 都兼容 S3 协议，用同一个驱动）：

```ts
// apps/api/src/modules/storage/s3.storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import type { IStorageService } from './storage.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,        // MinIO: http://localhost:9000
    region: process.env.S3_REGION ?? 'us-east-1',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });

  async upload(bucket, key, body, contentType) {
    await this.client.send(
      new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
    );
  }

  async getSignedUrl(bucket, key, expiresInSeconds = 3600) {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }

  async delete(bucket, key) {
    await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }
}
```

**环境变量**：

```bash
# 本地 MinIO
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# 生产阿里 OSS（S3 兼容模式）
# S3_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
# S3_FORCE_PATH_STYLE=false
# S3_ACCESS_KEY=...
# S3_SECRET_KEY=...
```

**上传流程**：web/admin → POST `/api/upload` → api 校验权限与文件类型 → 调 `S3StorageService.upload` → 返回对象 key → 前端用 `getSignedUrl` 拿临时下载链接。

---

## 八、pnpm workspaces 配置

### 8.1 `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 8.2 根 `package.json` 脚本编排

```jsonc
{
  "name": "hgbord",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@9.x",   // 锁定 pnpm 版本
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    // 并行启动三端开发服务器
    "dev": "pnpm -r --parallel --filter='./apps/*' run dev",

    // 构建所有包与 app
    "build": "pnpm -r run build",

    // lint / format
    "lint": "pnpm -r run lint",
    "lint:fix": "pnpm -r run lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",

    // 类型检查（依赖构建产物时需先 build）
    "typecheck": "pnpm -r run typecheck",

    // 单 app 操作示例
    "dev:web": "pnpm --filter @hgbord/web dev",
    "dev:admin": "pnpm --filter @hgbord/admin dev",
    "dev:api": "pnpm --filter @hgbord/api dev",

    // Prisma（统一在 database 包执行）
    "prisma:migrate": "pnpm --filter @hgbord/database prisma:migrate",
    "prisma:generate": "pnpm --filter @hgbord/database prisma:generate",
    "prisma:studio": "pnpm --filter @hgbord/database prisma studio",
    "db:seed": "pnpm --filter @hgbord/database db:seed",

    // 基础设施
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down",

    // Git hooks 安装
    "prepare": "husky install"
  },
  "devDependencies": {
    "prettier": "^3.x",
    "eslint": "^8.x",
    "husky": "^9.x",
    "lint-staged": "^15.x",
    "commitlint": "^19.x",
    "@commitlint/config-conventional": "^19.x",
    "typescript": "^5.x"
  }
}
```

> **说明**：`-r` = 递归所有 workspace，`--parallel` = 并行执行，`--filter` = 只作用于指定包。
> 本方案不引入 Turborepo / Nx，用 pnpm 原生能力 + `--parallel` 已足够；脚本足够简单、依赖少、上手快。

### 8.3 包间引用方式

子包 `package.json` 内用 `workspace:*` 声明内部依赖：

```jsonc
// apps/web/package.json
{
  "name": "@hgbord/web",
  "dependencies": {
    "@hgbord/shared": "workspace:*",
    "@hgbord/ui": "workspace:*",
    "@hgbord/utils": "workspace:*",
    "next": "^14.x",
    "react": "^18.x"
  }
}

// apps/api/package.json
{
  "name": "@hgbord/api",
  "dependencies": {
    "@hgbord/shared": "workspace:*",
    "@hgbord/database": "workspace:*",
    "@hgbord/utils": "workspace:*",
    "@nestjs/core": "^10.x",
    "zod": "^3.x"
  }
}
```

`workspace:*` 在发布时会自动替换为实际版本号。

### 8.4 （可选）catalog 统一第三方版本

pnpm 9+ 支持 catalog，把容易版本不一致的公共依赖集中管理：

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
catalog:
  react: ^18.3.1
  react-dom: ^18.3.1
  zod: ^3.23.8
  typescript: ^5.4.0
```

子包引用：

```jsonc
{ "dependencies": { "react": "catalog:", "zod": "catalog:" } }
```

避免三端 React / Zod 版本错配导致的诡异 bug。

### 8.5 Node 与 pnpm 版本锁定

```bash
# .nvmrc
20

# package.json（已含）
"packageManager": "pnpm@9.x",
"engines": { "node": ">=20.0.0" }
```

启用 Corepack：`corepack enable` 后，pnpm 版本由 `packageManager` 字段自动锁定，团队成员无需手动安装指定版本。

---

## 九、开发工具链

### 9.1 TypeScript 配置

- `tsconfig.base.json`（根目录，也可放 `packages/config`）放最严格的公共选项（strict、noUncheckedIndexedAccess 等）。
- 各 app / package 的 `tsconfig.json` 通过 `extends` 继承，只补充自身 `paths` / `include`。
- packages 之间通过 **包名**（`@hgbord/shared`）而非相对路径引用，配合 pnpm 的 symlink，TS 能正确解析类型。

### 9.2 ESLint + Prettier

- 规则定义在 `@hgbord/config/eslint`，各端 extends。
- Prettier 配置放根目录 `.prettierrc`，三端共用。
- ESLint 与 Prettier 冲突项用 `eslint-config-prettier` 关闭。

### 9.3 环境变量管理

```text
根目录:
  .env.example          # 所有需要的环境变量模板（提交到 Git）
  .env                  # 本地实际值（gitignore，不提交）

各 app:
  apps/web/.env.local   # web 专属（如 NEXT_PUBLIC_API_URL）
  apps/admin/.env.local
  apps/api/.env         # DATABASE_URL / REDIS_URL / S3_* / JWT_SECRET
```

**运行时校验**（推荐 T3 env 风格，启动即校验，缺失立即报错）：

```ts
// apps/api/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
});

export const env = envSchema.parse(process.env); // 启动时缺失/格式错即抛错
```

### 9.4 Git Hooks（husky + lint-staged + commitlint）

```bash
# 安装
pnpm add -D -w husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm exec husky init
```

`.husky/pre-commit`：

```bash
pnpm exec lint-staged
```

`package.json` 内：

```jsonc
"lint-staged": {
  "*.{ts,tsx,js,json,md}": ["prettier --write", "eslint --fix"]
}
```

`.husky/commit-msg`：

```bash
pnpm exec commitlint --edit "$1"
```

`commitlint.config.js`：

```js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

提交格式：`feat(api): add user login` / `fix(web): correct redirect` / `chore(db): bump schema`。

### 9.5 EditorConfig

```ini
# .editorconfig（根目录）
root = true
[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
[*.md]
trim_trailing_whitespace = false
```

---

## 十、开发流程

### 10.1 首次启动

```bash
# 1. 克隆后安装依赖（Corepack 会自动按 packageManager 装 pnpm）
corepack enable
pnpm install

# 2. 启动本地基础设施（PostgreSQL + Redis + MinIO）
pnpm docker:up

# 3. 复制环境变量模板并填写
cp .env.example .env
#   各 app 也需 cp apps/*/.env.example apps/*/.env.local

# 4. 应用数据库迁移并生成 client
pnpm prisma:migrate dev      # 或 pnpm --filter @hgbord/database prisma migrate dev
pnpm prisma:generate

# 5. （可选）灌入种子数据
pnpm db:seed

# 6. 启动三端开发服务器
pnpm dev
#   分别访问：
#   web   → http://localhost:3000
#   admin → http://localhost:3001
#   api   → http://localhost:4000
```

### 10.2 新增共享代码的流程

判断放哪里：

| 代码性质 | 放哪个包 |
|----------|----------|
| 前后端都要的数据结构 / 校验 | `@hgbord/shared` |
| 数据库相关 | `@hgbord/database` |
| 跨端通用 UI 组件 | `@hgbord/ui` |
| 无副作用的纯函数 | `@hgbord/utils` |
| 工具链配置 | `@hgbord/config` |
| 仅某一端用的逻辑 | 对应 `apps/*` |

新增后在该包的 `src/index.ts` 桶导出，消费方即可 `import { xxx } from '@hgbord/xxx'`。

### 10.3 跨包类型变更如何同步

以"后端给 user 增加一个 `avatar` 字段"为例：

```text
1. 改 packages/database/prisma/schema.prisma，给 User 加 avatar 字段
2. pnpm --filter @hgbord/database prisma migrate dev --name add_avatar
3. 改 packages/shared/src/dto/user.ts 的 UserVo，加 avatar
   → 此刻 web / admin 引用 UserVo 的地方，TS 立即提示需要处理新字段
4. 改 apps/api 对应 service，写入 avatar
5. 一个 PR 包含以上所有改动 → CI typecheck 通过 → 合并
```

**核心**：因为类型在 shared 单点定义，TS 编译器会强制把所有消费方"拽"到一致状态，不会漏改。

### 10.4 提交规范（Conventional Commits）

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(api): 实现用户登录` |
| `fix` | 修 bug | `fix(web): 修复登录跳转` |
| `refactor` | 重构 | `refactor(shared): 拆分 DTO 文件` |
| `chore` | 杂务 | `chore(config): 升级 ESLint` |
| `docs` | 文档 | `docs: 补充部署说明` |
| `test` | 测试 | `test(api): 补充 auth 单测` |

scope 用 `web` / `admin` / `api` / `shared` / `db` / `ui` / `config` 标注影响的端，便于生成 changelog 和定位变更范围。

---

## 十一、后续扩展点（占位，本期不展开）

以下内容本期不实现，仅作占位，后续单独出方案：

- **部署方案**：VPS + Docker Compose / Vercel + 云服务 / Kubernetes，需结合实际流量与运维能力选型。
- **CI/CD**：GitHub Actions / GitLab CI，含 install → lint → typecheck → test → build → migrate → deploy 流水线。
- **测试策略**：Vitest 单元测试（packages/*、api service）+ Playwright 端到端测试（web、admin 关键路径）。
- **监控与日志**：Sentry（错误监控）+ Pino/Winston 结构化日志 + Prometheus 指标 + 链路追踪（OpenTelemetry）。
- **API 文档**：NestJS Swagger 自动生成 OpenAPI，前端可据 codegen。
- **国际化（i18n）**：web 端 next-intl，admin 端相应方案。

---

> 本文档随项目演进持续更新。任何影响三端架构的改动（新增 app、调整共享包边界、改 schema 访问方式等）应在此文档同步修订，并通过 ADR（架构决策记录）沉淀决策背景。
