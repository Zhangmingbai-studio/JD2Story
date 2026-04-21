# JD2Story

程序员面试作战卡 —— 一个将职位描述转化为面试作战卡的网页工具。

目前本仓库仅包含项目的基础结构，尚未实现业务功能。

## 技术栈

- **Next.js 14**（App Router）+ **TypeScript**
- **Tailwind CSS** 用于样式
- **Prisma 6** + **PostgreSQL** 作为数据层
- **ESLint**（Next.js 默认配置）

## 前置条件

- Node.js **18+**（已在 20 和 24 测试通过）
- npm
- 一套 PostgreSQL 14+ 实例（见下方[本地 PostgreSQL](#local-postgresql)获取一键启动脚本）

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量模板并根据需要修改 DATABASE_URL
cp .env.example .env

# 3. 启动 PostgreSQL（见下方），并生成 Prisma client
npx prisma generate

# 4. 运行开发服务器
npm run dev
```

打开 http://localhost:3000 。

### 本地 PostgreSQL

如果你没有安装 PostgreSQL，可以用 Docker 快速启动。下面的账号信息与默认 `.env` 一致：

```bash
docker run --name jd2story-postgres \
  -e POSTGRES_USER=jd2story \
  -e POSTGRES_PASSWORD=jd2story \
  -e POSTGRES_DB=jd2story \
  -p 5432:5432 \
  -d postgres:16
```

之后用 `docker stop jd2story-postgres` / `docker start jd2story-postgres` 停止或重启容器。

在你向 `prisma/schema.prisma` 添加模型后，用如下命令应用变更：

```bash
npx prisma migrate dev --name init
```

## 可用脚本

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Next.js 开发服务器，支持热重载 |
| `npm run build` | 生产环境构建 |
| `npm run start` | 启动生产环境构建后的服务 |
| `npm run lint` | 运行 ESLint 检查代码风格 |
| `npx prisma generate` | 在编辑 `schema.prisma` 后重新生成 Prisma client |
| `npx prisma migrate dev` | 本地创建和应用数据库迁移 |
| `npx prisma studio` | 打开 Prisma Studio（数据库图形界面） |

## 目录结构

```
JD2Story/
├── prisma/
│   └── schema.prisma        # 数据库模型定义
└── src/
    ├── app/                 # Next.js App Router——路由、布局、页面
    ├── components/          # 共享的 UI 组件
    ├── features/            # 功能模块（每个业务域一个文件夹）
    ├── lib/                 # 客户端与工具类（如 prisma 单例）
    └── server/              # 仅服务端逻辑（服务端 action、服务等）
```

`@/*` 导入别名已在 `tsconfig.json` 配置，映射到 `src/*`。

## 环境变量

| 变量 | 作用 |
| --- | --- |
| `DATABASE_URL` | Prisma 使用的 PostgreSQL 连接字符串 |

`.env` 已被 gitignore。`.env.example` 为已提交的模板文件。
