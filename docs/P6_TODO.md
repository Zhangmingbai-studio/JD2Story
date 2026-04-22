# P6 剩余工作

> P6 代码骨架已完成并提交，本文档记录在公司 Windows 机上继续推进所需的步骤。

## 已完成

- [x] NextAuth + GitHub OAuth 代码集成（`src/lib/auth.ts`）
- [x] Prisma 模型：User / Account / Session / BattleCard（`prisma/schema.prisma`）
- [x] SessionProvider 包裹全局（`src/components/Providers.tsx` + `layout.tsx`）
- [x] TopNav 登录/退出/头像显示（`src/components/TopNav.tsx`）
- [x] 作战卡 CRUD API（`src/app/api/battle-cards/`）
- [x] 历史记录页面（`src/app/history/page.tsx`）
- [x] Result 页「保存」按钮（登录后可见）
- [x] `.env.example` 更新了所需环境变量
- [x] 公司机 `.env` 已写入 `NEXTAUTH_URL` 和新生成的 `NEXTAUTH_SECRET`

## 待完成

### 1. 安装本地 PostgreSQL（Windows 安装包路线）

1. 打开 https://www.postgresql.org/download/windows/ → 点 **Download the installer**
2. 选 PostgreSQL 17（或 16），下载后运行安装包
3. 安装时默认即可，注意：
   - **Port**: `5432`（默认）
   - **Superuser password**: 自己设一个（记下来，后面要用一次）
   - 不需要装 Stack Builder
4. 安装完成后，开始菜单里找到 **SQL Shell (psql)** 或 pgAdmin，用 superuser 登录后执行：

   ```sql
   CREATE USER jd2story WITH PASSWORD 'jd2story';
   CREATE DATABASE jd2story OWNER jd2story;
   GRANT ALL PRIVILEGES ON DATABASE jd2story TO jd2story;
   ```

   这一步是为了匹配 `.env` 里默认的 `DATABASE_URL=postgresql://jd2story:jd2story@localhost:5432/jd2story`。
   如果你想用别的用户名/密码，改 `.env` 也可以。

### 2. 推送 schema + 生成 Prisma Client

数据库就绪后，在项目根目录执行：

```bash
npx prisma generate
npx prisma db push
```

### 3. 创建 GitHub OAuth App（必须）

1. 打开 https://github.com/settings/developers
2. 点击 **New OAuth App**
3. 填写：
   - **Application name**: `JD2Story`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 注册后复制 **Client ID** 和 **Client Secret**，把两个值贴进 `.env` 的 `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

### 4. 验证流程

1. `npm run dev`
2. 点击右上角「GitHub 登录」
3. 授权后应跳转回首页，TopNav 显示头像和用户名
4. 生成一张作战卡，在 Result 页点击「保存」
5. 点击 TopNav「历史记录」，确认能看到并能查看/删除

### 5. 可选优化（未承诺）

- [ ] 历史记录页加分页
- [ ] 作战卡详情页（独立路由 `/history/[id]`，而非通过 sessionStorage 跳转）
- [ ] 左侧 sidebar 展示历史记录（MVP 计划中提到但非必须）
- [ ] 部署到 Vercel（需要配置生产环境的 `NEXTAUTH_URL` 和 PostgreSQL）
