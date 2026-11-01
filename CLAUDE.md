# CLAUDE.md
## Instructions for Claude Code — MemoryOS Project

This file is read automatically by Claude Code at the start of every session in this repo. Follow it strictly for every task, no matter how small.

---

## 0. MANDATORY FIRST STEP — Read the Context & Docs Before Any Task

Before writing a single line of code, planning a feature, fixing a bug, or making any architectural decision, review the foundation documents in `/context` and developer guides in `/docs`:

1. `context/01-PRD.md` — Product requirements, user personas, core modules & value proposition
2. `context/02-TRD.md` — Technical requirements, architecture, AI provider abstractions
3. `context/03-APP-FLOW.md` — Complete screen-by-screen flows and navigation states
4. `context/04-UI-UX-DESIGN-BRIEF.md` — Design system, tokens, colors, typography, and styling
5. `context/05-BACKEND-SCHEMA.md` — Database tables, pgvector configurations, relations & Prisma schema
6. `context/06-IMPLEMENTATION-PLAN.md` — Step-by-step roadmap phases & milestone verification
7. `context/07-AI-RANKING-STRATEGY.md` — Search, AI extraction & ranking strategies

Also refer to `/docs` for up-to-date architecture overviews, API references, and developer guides.

**Do not skip this even if the task seems small.** A "quick fix" that ignores the schema, design tokens, or API contracts creates drift between plan and codebase. If a task seems to require deviating from these docs, stop and flag the conflict explicitly instead of silently improvising (see §4).

---

## 1. Required Workflow Files

Two files must exist and be actively maintained. Create them if they don't exist yet.

### 1.1 `TODO.md` — created/updated at the start of EVERY task

At the start of any task (new feature, bug fix, refactor — anything), do this before writing code:

1. If `TODO.md` doesn't exist, create it at the repo root.
2. Break the current task into concrete steps matching the granularity of the Implementation Roadmap phases (e.g., not "build memories module" but "create memories.controller.ts with GET /memories route", "add CreateMemoryDto with Zod validation", "write memories.service.ts with user_id scoping").
3. Write these steps into `TODO.md` as a checklist using `- [ ]` markdown checkboxes.
4. As each step is completed, immediately update the box to `- [x]` — do not batch updates.
5. If new sub-steps are discovered mid-task, add them in place rather than doing undocumented work.
6. At the start of a new task, move fully-completed lists into `PROGRESS.md` and start fresh — `TODO.md` reflects current active work only.

**Format:**
```markdown
# TODO — [Current Task Name]
Started: [date]

- [x] Step already done
- [ ] Step in progress
- [ ] Step not yet started
- [ ] (newly discovered) extra step found mid-task
```

### 1.2 `PROGRESS.md` — updated after EVERY completed task

The persistent project history log — never deleted, only appended. After finishing any meaningful unit of work:

1. Open `PROGRESS.md` (create at repo root if missing).
2. Append a new dated entry at the **top** (most recent first) with: what was completed, which roadmap phase it belongs to, any deviations from docs, and what's next.
3. Never overwrite previous entries — this is the project's memory across Claude Code sessions.

**Format:**
```markdown
# PROGRESS LOG

## [YYYY-MM-DD] — [Short task title]
**Phase:** [Roadmap phase number/name]
**Completed:**
- [bullet summary of what was built/fixed]

**Deviations from docs (if any):**
- [none, OR explicit note with reasoning]

**Next up:**
- [explicit next task for the next session]

---
```

---

## 2. Project Context Summary

- **Product:** MemoryOS — a universal AI memory layer. Users install a Chrome extension that captures conversations from ChatGPT, Claude, Gemini, and Grok. An AI engine extracts structured memories (facts, preferences, decisions, workflows). Users can search their full AI history and inject relevant context into any new AI session with one click.
- **Monorepo structure:**
  - `apps/web` — Next.js 15 dashboard (app.memoryos.ai)
  - `apps/api` — NestJS backend API
  - `apps/extension` — Plasmo Chrome extension
  - `packages/types` — shared TypeScript interfaces
  - `packages/ui` — shared Shadcn/UI components
  - `packages/utils` — shared utilities
  - `packages/config` — shared ESLint, TSConfig, Tailwind configs
  - `prisma/` — single schema, all migrations
- **Core tech:** Next.js 15 + NestJS + PostgreSQL + pgvector + Redis + BullMQ + Plasmo + Clerk + Stripe + Anthropic SDK + OpenAI SDK
- **Core loop:** Extension captures chat → saved to IndexedDB → synced to API → BullMQ job runs Claude Haiku extraction → structured memories created → user approves suggestions → embeddings generated via pgvector → on next AI session, extension queries relevant memories → one-click inject into prompt → Stripe handles Pro/Teams billing
- **Build order:** Monorepo setup → DB + Prisma → API auth → Core CRUD → Extension foundation → Chat capture → AI extraction → Embeddings + search → Web dashboard → Billing → Polish + launch (see doc 11 for full phase breakdown)

---

## 3. Non-Negotiable Technical Rules

These come directly from the docs — repeating here because violating them is easy mid-task:

- **No business logic in NestJS controllers** — controllers call services, services call Prisma. Never put DB queries or business rules directly in a controller method.
- **Every DB query must be scoped to the authenticated user** — every `prisma.memories.findMany()`, `prisma.projects.findFirst()`, etc. must include `WHERE user_id = currentUserId`. There are no exceptions. This is enforced at the service layer, not just route guards.
- **All vector search goes through `search.service.ts` only** — no other file should run raw `$queryRaw` pgvector queries directly. Centralizing this prevents inconsistent similarity thresholds and missing user_id scoping.
- **Memory deletion must also clear embeddings** — when a memory is deleted, the embedding column is nulled/the row is removed. There is no cascade that handles this automatically if we ever switch to a separate vector store.
- **The extension sync endpoint (`POST /sync/push`) must stay accessible with the extension auth token** — do not accidentally gate it behind the same Clerk middleware as the dashboard. Extension uses a separate token flow.
- **Check usage limits (memory_limit, extraction_limit) BEFORE calling Gemini API** — never waste free tier quota extracting memories for a user who has hit their plan limit. Track daily Gemini usage in usage_logs against the 1500 req/day free tier ceiling.
- **Stripe webhook signature verification is mandatory** before updating any user's plan — never process an unverified webhook payload.
- **Design tokens come from `docs/08-UI-UX-DESIGN-SYSTEM.md`** — do not introduce ad-hoc hex colors or font sizes not defined there. Primary accent is `#7C5CFC` (Neural Violet) — used for CTAs and active states only, not scattered everywhere.
- **Extension bundle: no heavy dependencies** — the content script injected into AI platform pages must stay lightweight. No full React bundles in content scripts unless via Plasmo's shadow DOM pattern. Sidebar uses React; raw capture logic does not.
- **Memory type must always be one of the 8 defined types:** `personal | preference | tool | project | workflow | decision | template | entity` — never invent new types on the fly. If a new type is genuinely needed, update the docs first.
- **Offline-first in extension is non-negotiable** — every capture saves to IndexedDB first, syncs to API second. Never make a capture dependent on a successful API call.

---

## 4. Handling Deviations from the Docs

If, while working, something in the docs doesn't work technically (this is normal):

1. Do **not** silently improvise a different approach.
2. Make the smallest reasonable deviation needed.
3. Log it explicitly in that task's `PROGRESS.md` entry under "Deviations from docs."
4. If the deviation changes an API contract, schema table, or core flow — also leave a `> **Note (deviation, [date]):**` blockquote in the relevant doc file so docs and code stay in sync.

---

## 5. Session Start Checklist (every session, in order)

1. Read all files in `/docs` (or re-skim if already read this session).
2. Read `PROGRESS.md` top entry — know exactly where the last session ended.
3. Read current `TODO.md` — resume unfinished task rather than starting fresh, unless user says otherwise.
4. Confirm "what's next" with user only if genuinely ambiguous — otherwise proceed directly per `PROGRESS.md` "Next up."
5. Create/update `TODO.md` for the current task.
6. Do the work.
7. Update `TODO.md` checkboxes as you go.
8. On task completion: append `PROGRESS.md` entry, clear completed checklist from `TODO.md`.

---

## 6. Architecture Decisions to Never Revisit

These are locked. Do not re-open these debates mid-task:

- **Monorepo with Turborepo + pnpm** — not separate repos
- **NestJS for API** — not Express, not Hono, not FastAPI
- **Clerk for auth** — not NextAuth, not custom JWT
- **pgvector inside PostgreSQL** — not Pinecone, not Weaviate, not Qdrant
- **BullMQ + Redis for queues** — not SQS, not Inngest (for now)
- **Plasmo for extension** — not raw webpack MV3
- **Stripe for payments** — not Paddle, not Lemonsqueezy (can revisit for India billing, but default is Stripe)
- **Gemini only for all AI** — not Anthropic, not OpenAI. SDK: `@google/generative-ai`. Extraction + embeddings + summaries all use Gemini. Single env var: `GEMINI_API_KEY`. Free tier: 1500 req/day — track this in usage_logs.
- **Local-first extension storage (IndexedDB via Dexie)** — not relying on API availability for captures

If you find a strong technical reason one of these must change, flag it explicitly to the user — don't quietly swap it out.

---

## 7. Figma MCP — Mandatory for All Frontend Work

A Figma MCP server is connected and running locally. Use it for every frontend task.

Rules:
- Before building any UI component, page, or layout — query the Figma MCP first for that component's design
- Never guess colors, spacing, border radius, or font sizes — read them from Figma directly
- If a component exists in Figma, match it pixel-perfectly. If it doesn't exist yet, fall back to tokens from `docs/08-UI-UX-DESIGN-SYSTEM.md`
- After building a component, cross-check it against Figma — flag any deviation explicitly
- This applies to: apps/web (dashboard), apps/extension (sidebar + popup), and the marketing landing page

---

## 8. Communication Style

- Keep explanations concise — what was built, what changed, why.
- When a task touches multiple docs, explicitly note which docs were referenced.
- Flag any conflict between two docs rather than picking one silently.
- When reporting completion, always state what the next logical task is per the roadmap.