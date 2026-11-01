# Developer Setup & Local Engineering Guide

This guide walks through configuring, running, and verifying the entire MemoryOS stack locally on Windows, macOS, or Linux.

---

## 1. Prerequisites

Before starting, ensure your system has the following tools installed:

- **Node.js**: `v20.x` or later (LTS recommended)
- **pnpm**: `v9.1.0` or later (`npm install -g pnpm`)
- **PostgreSQL**: PostgreSQL 16 with the `pgvector` and `uuid-ossp` extensions enabled (a free Supabase project is recommended and pre-configured)
- **Redis**: Redis 6+ or 7+ (MemoryOS includes an automatic Windows runner, or you can run Redis via Docker)

---

## 2. Environment Variables Configuration

Copy the example environment configuration into `.env` at the repository root:

```bash
cp .env.example .env
```

### Environment Variables Breakdown

| Variable | Required | Description | Example |
|:---|:---:|:---|:---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (must have pgvector enabled) | `postgresql://postgres:password@host:5432/postgres` |
| `GEMINI_API_KEYS` | Yes | Comma-separated Gemini API keys for round-robin rotation | `AIzaSy...,AIzaSy...` |
| `CLERK_SECRET_KEY` | Yes | Clerk secret API key for backend JWT verification | `sk_test_...` |
| `CLERK_WEBHOOK_SECRET` | Yes | Svix webhook secret for syncing user events | `whsec_...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Public Clerk key for Next.js frontend | `pk_test_...` |
| `PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Public Clerk key for Chrome extension | `pk_test_...` |
| `REDIS_URL` | Yes | Redis connection URI for BullMQ queues | `redis://localhost:6379` |
| `NEXT_PUBLIC_API_URL` | Yes | URL of NestJS API server | `http://localhost:3001` |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret key for Pro subscription handling | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signature verification secret | `whsec_...` |

---

## 3. Installation & Database Provisioning

### Step 1: Install Dependencies
Run from the repository root:

```bash
pnpm install
```

### Step 2: Generate Prisma Client & Run Migrations
Generate Prisma TypeScript bindings and apply database migrations to your PostgreSQL instance:

```bash
# Generate Prisma client bindings
pnpm db:generate

# Apply SQL migrations
pnpm db:migrate

# Verify database connection and pgvector extension
pnpm db:verify
```

### Step 3: Seed Sample Data
Populate the database with a test user, default workspace projects, and sample memories:

```bash
pnpm db:seed
```

---

## 4. Starting the Redis Queue Infrastructure

MemoryOS uses Redis to drive the `memory-extraction` and `embeddings` BullMQ queues.

### Option A: Automatic Windows Dev Runner (No Docker Needed)
MemoryOS includes a built-in helper that runs a lightweight local Redis instance on Windows:

```bash
pnpm redis:dev
```

### Option B: Docker Compose (macOS / Linux / Docker Users)
If Docker is running on your machine:

```bash
docker compose up -d
```

### Verify Queues
Run the diagnostic script to confirm BullMQ can connect and process jobs:

```bash
pnpm queue:verify
```

---

## 5. Running the Monorepo

Start all services simultaneously using Turborepo:

```bash
pnpm dev
```

This launches:
- **`apps/api`** (NestJS): `http://localhost:3001`
  - Swagger Documentation: `http://localhost:3001/api`
- **`apps/web`** (Next.js 15): `http://localhost:3000`
- **`apps/extension`** (Plasmo): Auto-compiles to `apps/extension/build/chrome-mv3-dev`

---

## 6. Monorepo Script Reference

The following root scripts are defined in `package.json`:

| Script | Command | Action |
|:---|:---|:---|
| `pnpm dev` | `turbo run dev` | Launch all apps in hot-reload development mode |
| `pnpm build` | `turbo run build` | Compile production bundles across all packages |
| `pnpm lint` | `turbo run lint` | Run ESLint across API, Web, Extension, and Packages |
| `pnpm typecheck` | `turbo run typecheck` | Run TypeScript compiler checks |
| `pnpm format` | `prettier --write ...` | Format all TypeScript, TSX, and Markdown files |
| `pnpm db:generate` | `prisma generate` | Regenerate `@prisma/client` types |
| `pnpm db:migrate` | `prisma migrate dev` | Apply migrations to database |
| `pnpm db:studio` | `prisma studio` | Launch local visual database browser |
| `pnpm db:seed` | `prisma db seed` | Seed database with initial records |
| `pnpm db:verify` | `tsx scripts/verify-db.ts` | Verify PostgreSQL connection and pgvector |
| `pnpm queue:verify`| `tsx scripts/verify-queues.ts` | Test BullMQ Redis job push and worker pop |
| `pnpm redis:dev` | `tsx scripts/start-redis-dev.ts` | Start local Redis server on Windows |
