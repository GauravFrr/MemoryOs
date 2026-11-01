# PROGRESS LOG

## [2026-07-01] — Phase 6a: Context Injection Engine — API (Completed)
**Phase:** Phase 6a — POST /inject/build API endpoint
**Completed:**
- Created `SearchModule` + `SearchService` with `semanticSearch()` (pgvector HNSW cosine distance, `::uuid` casting, explicit column selection to avoid vector deserialization error) and `fetchTopMemories()` fallback
- Created `InjectModule`, `InjectController`, `InjectService` wired to `POST /inject/build`
- `BuildInjectionDto`: platform, project_id (optional), topic (optional), max_tokens (max 4000)
- Logic: if `topic` provided → embed with gemini-embedding-2 (768-dim) → semantic search; if not → score + recency sort, no Gemini call wasted
- Output format: `[MemoryOS Context — {project}]\n• memory1\n• memory2` (TRD Section 5 format)
- Usage logging: every call tracked in `usage_logs` with `action: 'injection_built'`
- Verified both paths with `test_inject.ts` script — both returned correct formatted markdown with memories from seed data
- Fixed TS errors: `catch (e: any)`, `userId` field name in usageLog, `as any[]` casts for raw query returns

**Deviations from docs (if any):**
- Embedding model is `gemini-embedding-2` with `outputDimensionality: 768` (not `text-embedding-3-small` from TRD — OpenAI unavailable on current keys)
- `SELECT m.*` replaced with explicit column selection to avoid Prisma vector deserialization error

**Next up:**
- Phase 6b: Extension sidebar architecture scaffold

---

## [2026-07-05] — Phase 6b: Extension Native Inline Redesign (Completed)
**Phase:** Phase 6b — Plasmo inline content script + scoped platform adapters + MemoryPopover UI
**Completed:**
- Removed the old layout-disrupting sidebar panel (`contents/sidebar.tsx` and custom React sidebar app).
- Built a native DOM injector (`contents/injector.tsx`) using Plasmo.
- Positioned the **🧠 Memory** button directly into the active prompt toolbar area of Claude (`claude.ai` inside the footer `<fieldset>`) and ChatGPT (anchored under the `#prompt-textarea` form).
- Scoped all element selectors specifically inside the composer container (e.g. `fieldset` for Claude) to prevent matching sidebar chat list titles.
- Built a floating popover (`components/Popover/MemoryPopover.tsx`) styled to match Claude's dark theme using pure inline styles.
- Connected the popover to `POST /inject/build` via `apiFetch` using `.env.local` configuration.
- Unified the action flow to one-click: **Find & Inject** queries the API, prepends the returned memories directly to the textarea, displays success status, and auto-closes.
- Added Plasmo type declarations (`index.d.ts`) to fix TS editor squiggles on `data-text` imports.
- Fixed the API `@nestjs/config` dependency and TS error on `lastError` type in `ai.service.ts`.
- Compiles cleanly in both API (`pnpm build`) and extension (`pnpm build`).

---



## [2026-06-29] — Phase 3: Authentication Pipeline (Completed)
**Phase:** Phase 3 — Clerk Auth (Web, API, Extension)
**Completed:**
- Apps/web: Installed `@clerk/nextjs`, added `middleware.ts`, wrapped in `ClerkProvider`, created `sign-in/[[...sign-in]]/page.tsx` and `sign-up/[[...sign-up]]/page.tsx`
- Apps/api: Installed `@clerk/backend`, created `ClerkGuard` for JWT validation on protected routes, built `CurrentUser` decorator
- Apps/api: Created `AuthModule` handling POST `/auth/webhook` with Svix signature verification and GET `/auth/me`
- Apps/extension: Integrated `@clerk/chrome-extension`, fixed `popup/index.tsx` for v3, created `TokenSyncer` to persist session token to `chrome.storage.local` for API requests
- Resolved Next.js environment cache and port conflict (EADDRINUSE) between `next dev` and `nest start`
- End to end test passed: User signup on web triggered ngrok webhook, processed by NestJS, and successfully created user row in Supabase PostgreSQL DB.

**Deviations from docs (if any):**
- Forced Next.js to use port 3000 and NestJS to use port 3001 by removing `PORT` from `.env` to prevent port collisions on startup.
- Fixed Clerk extension v3 imports (removed deprecated `SignedIn`/`SignedOut` components in favor of explicit `userId` checks in popup).

**Next up:**
- Phase 5: AI Integration (Embeddings, LLM processing)

---

## [2026-06-25] — Phase 2: Database & Queue Infrastructure
**Phase:** Phase 2 — Database + Prisma + Redis/BullMQ
**Completed:**
- Supabase connected via `DATABASE_URL`; `pgvector` and `uuid-ossp` extensions enabled
- Full Prisma schema written per `docs/05-BACKEND-SCHEMA.md` (11 tables, indexes, pgvector + tsvector on `memories`)
- Migrations applied: `20250625120000_init` (baseline) + `20250625120100_indexes_vectors_search` (HNSW, GIN, search trigger)
- `prisma/seed.ts` — test user, project, 2 memories; verified in Supabase
- `@memoryos/queue` package with `memory-extraction` and `embeddings` queue names
- BullMQ + Redis verified via `pnpm queue:verify` (Windows dev: auto-downloads Redis 5.0.14)
- `docker-compose.yml` for Redis 7 when Docker is available

**Deviations from docs (if any):**
- Supabase already had tables from a prior attempt — init migration baselined with `migrate resolve`, indexes/vectors applied in follow-up migration
- Windows has no native Redis 5+; `scripts/lib/redis-windows.ts` downloads tporadowski Redis 5.0.14 for local dev verification

**Next up:**
- Phase 3: Clerk auth in web + NestJS guard + `/auth/webhook` + `/auth/me`

---

## [2026-06-25] — Phase 1: Foundation (Monorepo Setup)
**Phase:** Phase 1 — Foundation (Weeks 1–2, monorepo portion)
**Completed:**
- Cleared prior codebase to `.backup`
- Initialized Turborepo monorepo with pnpm workspaces
- Created shared packages: `config`, `types`, `ui`, `utils`
- Scaffolded `apps/web` (Next.js 15), `apps/api` (NestJS), `apps/extension` (Plasmo)
- Installed dependencies; `pnpm lint` and `pnpm typecheck` pass

**Deviations from docs (if any):**
- Repo docs live under 7 files (`01-PRD.md` … `07-AI-RANKING-STRATEGY.md`) rather than the 15 filenames referenced in CLAUDE.md

**Next up:**
- Phase 2: Database + Prisma schema, migrations, seed, Redis, BullMQ queues

---
