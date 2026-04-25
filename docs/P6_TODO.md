# P6 收尾清单

> P6 代码侧收尾已完成，当前机器已配置本地环境变量并执行数据库 schema 同步；生产 PostgreSQL D1 也已完成。剩余事项主要是 Vercel 部署和生产 GitHub OAuth 回调。

## 已完成

- [x] NextAuth + GitHub OAuth 代码集成（`src/lib/auth.ts`）
- [x] Prisma 模型：User / Account / Session / BattleCard（`prisma/schema.prisma`）
- [x] SessionProvider 包裹全局（`src/components/Providers.tsx` + `layout.tsx`）
- [x] TopNav 登录/退出/头像显示（`src/components/TopNav.tsx`）
- [x] 作战卡 CRUD API（`src/app/api/battle-cards/`）
- [x] 历史记录页面（`src/app/history/page.tsx`）
- [x] Result 页「保存」按钮（登录后可见）
- [x] `.env.example` 更新了所需环境变量
- [x] 当前机器 `.env` 已写入 `NEXTAUTH_URL`、`NEXTAUTH_SECRET`、GitHub OAuth 变量
- [x] 历史记录分页（`GET /api/battle-cards?page=&pageSize=`）
- [x] 作战卡详情页（`/history/[id]`，直接从 DB 读取，不再依赖 `sessionStorage` 跳转）
- [x] Result / History 详情页复用同一套作战卡展示组件（`src/components/BattleCardViewer.tsx`）
- [x] Result / History 详情页左侧展示最近历史记录（`src/components/HistorySidebar.tsx`）
- [x] API 补齐用户 id 缺失保护与标题 trim
- [x] 当前机器已执行 `npx prisma db push`，数据库 schema 已同步
- [x] 已补生产部署说明（`docs/DEPLOYMENT.md`）
- [x] 已补生产环境变量模板（`.env.production.example`）
- [x] 已生成初始 Prisma 迁移（`prisma/migrations/20260425160000_init/migration.sql`）

## 上线任务

- [x] D1 准备：选定 Neon 作为生产 PostgreSQL，仓库已准备好迁移与操作文档
- [x] D1 执行：在 Neon 后台创建生产数据库，复制 direct `DATABASE_URL` 并执行 `npx prisma migrate deploy`
- [ ] D2：部署到 Vercel 并配置生产环境变量
- [ ] D3：配置 GitHub OAuth 生产回调
- [ ] D4：线上验登录、生成、保存、历史详情、删除

## 本地环境

### 1. GitHub OAuth App

1. 打开 https://github.com/settings/developers
2. 点击 **New OAuth App**
3. 填写：
   - **Application name**: `JD2Story`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 注册后复制 **Client ID** 和 **Client Secret**，把两个值贴进 `.env` 的 `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

### 2. 配置 .env

在 `.env` 中填入：

```env
GITHUB_CLIENT_ID="你的 Client ID"
GITHUB_CLIENT_SECRET="你的 Client Secret"
```

`NEXTAUTH_SECRET` 和 `NEXTAUTH_URL` 已经配好了。

### 3. 初始化数据库（当前机器已完成，新机器参考）

当前工作区已执行过：

```bash
npx prisma db push
```

输出结果为 database already in sync，并已重新生成 Prisma Client。

如果换一台 macOS 新机器，需要：

```bash
# 安装 PostgreSQL（如果没有）
brew install postgresql@17
brew services start postgresql@17

# 创建数据库
createdb jd2story

# 推送 schema
npx prisma db push
```

如果换一台 Windows 新机器，可走 PostgreSQL 安装包路线：

1. 打开 https://www.postgresql.org/download/windows/ → 点 **Download the installer**
2. 选 PostgreSQL 17（或 16），下载后运行安装包
3. 安装时默认即可，注意：
   - **Port**: `5432`（默认）
   - **Superuser password**: 自己设一个
   - 不需要装 Stack Builder
4. 安装完成后，用 SQL Shell 或 pgAdmin 登录后执行：

   ```sql
   CREATE USER jd2story WITH PASSWORD 'jd2story';
   CREATE DATABASE jd2story OWNER jd2story;
   GRANT ALL PRIVILEGES ON DATABASE jd2story TO jd2story;
   ```

5. 在项目根目录执行：

   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 验证流程

1. `npm run dev`
2. 点击右上角「GitHub 登录」
3. 授权后应跳转回首页，TopNav 显示头像和用户名
4. 生成一张作战卡，在 Result 页点击「保存」
5. 点击 TopNav「历史记录」，确认能看到并能查看/删除

## 可选优化（未承诺）

- [x] 历史记录页加分页
- [x] 作战卡详情页（独立路由 `/history/[id]`，而非通过 sessionStorage 跳转）
- [x] 左侧 sidebar 展示历史记录（MVP 计划中提到但非必须）
- [ ] 部署到 Vercel（需要配置生产环境的 `NEXTAUTH_URL` 和 PostgreSQL）
