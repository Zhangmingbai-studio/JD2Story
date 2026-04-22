# P6 剩余工作

> P6 代码骨架已完成并提交，以下是到公司后需要完成的配置和收尾工作。

## 已完成

- [x] NextAuth + GitHub OAuth 代码集成（`src/lib/auth.ts`）
- [x] Prisma 模型：User / Account / Session / BattleCard（`prisma/schema.prisma`）
- [x] SessionProvider 包裹全局（`src/components/Providers.tsx` + `layout.tsx`）
- [x] TopNav 登录/退出/头像显示（`src/components/TopNav.tsx`）
- [x] 作战卡 CRUD API（`src/app/api/battle-cards/`）
- [x] 历史记录页面（`src/app/history/page.tsx`）
- [x] Result 页「保存」按钮（登录后可见）
- [x] `.env.example` 更新了所需环境变量

## 待完成

### 1. 创建 GitHub OAuth App（必须）

1. 打开 https://github.com/settings/developers
2. 点击 **New OAuth App**
3. 填写：
   - **Application name**: `JD2Story`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 注册后复制 **Client ID** 和 **Client Secret**

### 2. 配置 .env（必须）

在 `.env` 中填入：

```
GITHUB_CLIENT_ID="你的 Client ID"
GITHUB_CLIENT_SECRET="你的 Client Secret"
```

`NEXTAUTH_SECRET` 和 `NEXTAUTH_URL` 已经配好了。

### 3. 初始化数据库（必须）

公司电脑上需要：

```bash
# 安装 PostgreSQL（如果没有）
brew install postgresql@17
brew services start postgresql@17

# 创建数据库
createdb jd2story

# 推送 schema
npx prisma db push
```

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
