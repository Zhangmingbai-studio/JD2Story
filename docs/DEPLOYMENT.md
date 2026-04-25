# JD2Story Deployment

## D1: Production PostgreSQL

Decision: use Neon for the production PostgreSQL database.

Why Neon:
- It provides a standard PostgreSQL connection string that Prisma can use directly.
- It fits Vercel/serverless deployment well.
- It supports pooled and direct connection strings. Use the direct/unpooled connection string for Prisma migrations, and use the pooled connection string later for Vercel runtime.

Official references:
- Neon connection strings: https://neon.com/docs/get-started-with-neon/connect-neon
- Prisma production migration command: https://www.prisma.io/docs/cli/migrate/deploy

### Create The Database

1. Open https://console.neon.tech
2. Create a new project named `jd2story-prod`.
3. Region: choose the closest stable region for expected users.
4. Database name: `jd2story`.
5. Role name: keep Neon default or use `jd2story`.
6. Open **Connect** in the Neon dashboard.
7. For D1 schema initialization, copy the direct/unpooled PostgreSQL connection string.
8. For D2 Vercel runtime, copy the pooled PostgreSQL connection string separately.

The URL should look like:

```txt
postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
```

Keep it secret. For D1, use the direct/unpooled URL only as a temporary shell `DATABASE_URL` when running Prisma migrations. For D2, use the pooled URL as Vercel's production `DATABASE_URL`.

### Initialize Schema

This repo now includes an initial Prisma migration:

```txt
prisma/migrations/20260425160000_init/migration.sql
```

After the direct/unpooled production URL is available, initialize the production database with:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@DIRECT_HOST/dbname?sslmode=require" npx prisma migrate deploy
```

Do not paste the real production database URL into a committed file. Use Vercel environment variables or a temporary local shell variable.

### D1 Done Means

- Neon project exists.
- A direct/unpooled production URL exists for migrations.
- A pooled production URL exists for the later Vercel `DATABASE_URL`.
- `npx prisma migrate deploy` succeeds against the direct/unpooled URL.
- Neon Table view shows these tables:
  - `User`
  - `Account`
  - `Session`
  - `VerificationToken`
  - `BattleCard`
  - `_prisma_migrations`

Current status: D1 is complete for the Neon production database. The initial migration has been applied successfully.

## Later Steps

D2: deploy the Next.js app to Vercel and set the production env vars.

D3: create/configure the production GitHub OAuth App:

```txt
Homepage URL:
https://your-project.vercel.app

Authorization callback URL:
https://your-project.vercel.app/api/auth/callback/github
```

D4: verify production login, generation, save, history detail, and delete flows.
