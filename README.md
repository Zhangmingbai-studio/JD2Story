# JD2Story

程序员面试作战卡 — A web tool that turns a job description into interview battle cards.

Currently this repo contains only project scaffolding; no business features yet.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Prisma 6** + **PostgreSQL** for data
- **ESLint** (Next.js defaults)

## Prerequisites

- Node.js **18+** (tested on 20 and 24)
- npm
- A PostgreSQL 14+ instance (see [Local PostgreSQL](#local-postgresql) for a one-liner)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and edit DATABASE_URL if needed
cp .env.example .env

# 3. Start PostgreSQL (see below), then generate the Prisma client
npx prisma generate

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000.

### Local PostgreSQL

If you don't have PostgreSQL installed, start one with Docker. The credentials below match the default `.env`:

```bash
docker run --name jd2story-postgres \
  -e POSTGRES_USER=jd2story \
  -e POSTGRES_PASSWORD=jd2story \
  -e POSTGRES_DB=jd2story \
  -p 5432:5432 \
  -d postgres:16
```

Stop / restart later with `docker stop jd2story-postgres` / `docker start jd2story-postgres`.

Once models are added to `prisma/schema.prisma`, apply them with:

```bash
npx prisma migrate dev --name init
```

## Available scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js dev server with HMR |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate the Prisma client after editing `schema.prisma` |
| `npx prisma migrate dev` | Create and apply a migration locally |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |

## Directory structure

```
JD2Story/
├── prisma/
│   └── schema.prisma        # DB schema (models go here)
└── src/
    ├── app/                 # Next.js App Router — routes, layouts, pages
    ├── components/          # Shared UI components
    ├── features/            # Feature modules (one folder per business domain)
    ├── lib/                 # Clients & utilities (e.g. prisma singleton)
    └── server/              # Server-only logic (server actions, services)
```

Import alias `@/*` is configured in `tsconfig.json` and maps to `src/*`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |

`.env` is gitignored. `.env.example` is the committed template.
