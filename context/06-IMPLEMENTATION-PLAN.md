# MemoryOS — Implementation Plan & Folder Structure
**Version:** 1.0

---

## 1. Monorepo Structure

```
memoryos/
├── apps/
│   ├── web/                    # Next.js 15 Dashboard (app.memoryos.ai)
│   ├── extension/              # Plasmo Chrome Extension
│   └── api/                    # NestJS Backend API
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared UI components (Shadcn base)
│   ├── utils/                  # Shared utility functions
│   └── config/                 # Shared configs (eslint, tsconfig, tailwind)
│
├── prisma/
│   ├── schema.prisma           # Single source of truth for DB schema
│   ├── migrations/             # All migration files
│   └── seed.ts                 # Seed data for development
│
├── docs/                       # This documentation
├── scripts/                    # Deployment, utility scripts
├── .github/
│   └── workflows/              # CI/CD (GitHub Actions)
├── turbo.json                  # Turborepo config
├── package.json                # Root workspace
└── pnpm-workspace.yaml
```

---

## 2. App Directory Structures

### 2.1 Web App (Next.js)

```
apps/web/
├── app/
│   ├── (marketing)/            # Public routes (landing, pricing)
│   │   ├── page.tsx            # Landing page
│   │   ├── pricing/page.tsx
│   │   └── blog/
│   │
│   ├── (auth)/                 # Auth routes (Clerk-handled)
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   │
│   ├── onboarding/
│   │   └── page.tsx            # Multi-step onboarding
│   │
│   └── (dashboard)/            # Protected app routes
│       ├── layout.tsx          # Dashboard layout (sidebar + topbar)
│       ├── home/page.tsx
│       ├── projects/
│       │   ├── page.tsx        # Projects list
│       │   └── [id]/
│       │       └── page.tsx    # Single project
│       ├── memories/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── conversations/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── search/page.tsx
│       ├── graph/page.tsx
│       ├── analytics/page.tsx
│       └── settings/
│           ├── profile/page.tsx
│           ├── integrations/page.tsx
│           ├── billing/page.tsx
│           └── privacy/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── DashboardLayout.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── CreateProjectModal.tsx
│   │   └── ProjectHeader.tsx
│   ├── memories/
│   │   ├── MemoryCard.tsx
│   │   ├── MemoryList.tsx
│   │   ├── MemoryBadge.tsx
│   │   ├── ScoreBar.tsx
│   │   ├── ApprovalModal.tsx
│   │   └── CreateMemoryModal.tsx
│   ├── conversations/
│   │   ├── ConversationCard.tsx
│   │   ├── ConversationList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── TranscriptView.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchTypeToggle.tsx
│   ├── analytics/
│   │   ├── StatCard.tsx
│   │   ├── UsageChart.tsx
│   │   └── TokenSavingsCard.tsx
│   └── ui/                     # Base UI (Shadcn components)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
│
├── hooks/
│   ├── useProjects.ts
│   ├── useMemories.ts
│   ├── useConversations.ts
│   ├── useSearch.ts
│   └── usePendingApprovals.ts
│
├── lib/
│   ├── api.ts                  # API client (axios instance)
│   ├── clerk.ts                # Clerk config
│   └── utils.ts
│
└── store/
    ├── useAppStore.ts          # Zustand global state
    └── useSearchStore.ts
```

### 2.2 Extension (Plasmo)

```
apps/extension/
├── background.ts               # Service worker
├── contents/
│   ├── sidebar.tsx             # Sidebar injected on AI platforms
│   └── capture.ts              # Chat capture logic
│
├── popup/
│   └── index.tsx               # Extension popup
│
├── options/
│   └── index.tsx               # Options page
│
├── lib/
│   ├── adapters/
│   │   ├── base.ts             # Base adapter interface
│   │   ├── chatgpt.ts          # ChatGPT DOM adapter
│   │   ├── claude.ts           # Claude DOM adapter
│   │   ├── gemini.ts           # Gemini DOM adapter
│   │   └── registry.ts         # Auto-detect platform
│   ├── storage/
│   │   ├── db.ts               # Dexie (IndexedDB) setup
│   │   ├── conversations.ts    # Conversation storage ops
│   │   └── memories.ts         # Memory storage ops
│   ├── sync/
│   │   ├── push.ts             # Push local data to API
│   │   ├── pull.ts             # Pull memories from API
│   │   └── queue.ts            # Offline queue manager
│   ├── extraction/
│   │   └── client.ts           # Calls API extraction endpoint
│   ├── injection/
│   │   └── builder.ts          # Builds context string for injection
│   └── auth.ts                 # Token management
│
├── components/
│   ├── Sidebar/
│   │   ├── SidebarApp.tsx
│   │   ├── InjectTab.tsx
│   │   ├── CaptureTab.tsx
│   │   └── MemoryTab.tsx
│   ├── Popup/
│   │   └── PopupApp.tsx
│   └── shared/
│       ├── MemoryCard.tsx
│       └── PlatformBadge.tsx
│
└── manifest.json (generated by Plasmo)
```

### 2.3 API (NestJS)

```
apps/api/
├── src/
│   ├── main.ts                 # Bootstrap, Swagger setup
│   ├── app.module.ts           # Root module
│   │
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts  # /auth routes
│   │   ├── auth.service.ts
│   │   ├── clerk.guard.ts      # JWT validation guard
│   │   └── clerk.strategy.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── projects/
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   └── dto/
│   │       ├── create-project.dto.ts
│   │       └── update-project.dto.ts
│   │
│   ├── conversations/
│   │   ├── conversations.module.ts
│   │   ├── conversations.controller.ts
│   │   ├── conversations.service.ts
│   │   └── dto/
│   │       └── create-conversation.dto.ts
│   │
│   ├── memories/
│   │   ├── memories.module.ts
│   │   ├── memories.controller.ts
│   │   ├── memories.service.ts
│   │   ├── extraction.service.ts   # AI extraction logic
│   │   ├── scoring.service.ts      # Memory scoring
│   │   └── dto/
│   │       ├── create-memory.dto.ts
│   │       └── update-memory.dto.ts
│   │
│   ├── search/
│   │   ├── search.module.ts
│   │   ├── search.controller.ts
│   │   ├── search.service.ts
│   │   └── embedding.service.ts    # Vector embedding generation
│   │
│   ├── inject/
│   │   ├── inject.module.ts
│   │   ├── inject.controller.ts
│   │   └── inject.service.ts       # Context builder
│   │
│   ├── sync/
│   │   ├── sync.module.ts
│   │   ├── sync.controller.ts
│   │   └── sync.service.ts
│   │
│   ├── billing/
│   │   ├── billing.module.ts
│   │   ├── billing.controller.ts
│   │   └── billing.service.ts      # Stripe integration
│   │
│   ├── analytics/
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.service.ts
│   │
│   ├── ai/
│   │   ├── ai.module.ts
│   │   ├── ai.service.ts           # Provider abstraction
│   │   ├── providers/
│   │   │   ├── claude.provider.ts
│   │   │   ├── openai.provider.ts
│   │   │   └── base.provider.ts
│   │   └── prompts/
│   │       ├── extraction.prompt.ts
│   │       └── summary.prompt.ts
│   │
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── extraction.processor.ts # BullMQ: process extraction jobs
│   │   └── embedding.processor.ts  # BullMQ: process embedding jobs
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   └── common/
│       ├── guards/
│       │   ├── auth.guard.ts
│       │   └── rate-limit.guard.ts
│       ├── decorators/
│       │   └── current-user.decorator.ts
│       ├── interceptors/
│       │   └── logging.interceptor.ts
│       ├── filters/
│       │   └── http-exception.filter.ts
│       └── middleware/
│           └── usage-tracking.middleware.ts
│
└── test/
    ├── memories.e2e.spec.ts
    └── search.e2e.spec.ts
```

---

## 3. Implementation Phases

### Phase 1: Foundation (Weeks 1–2)

**Goal:** Monorepo running, DB live, auth working, basic CRUD.

#### Week 1: Setup
```
Day 1-2:
☐ Init Turborepo monorepo with pnpm workspaces
☐ Create apps/web (Next.js 15 + TypeScript + Tailwind + Shadcn)
☐ Create apps/api (NestJS + TypeScript)
☐ Create packages/types with shared TypeScript interfaces
☐ Set up ESLint + Prettier + TypeScript configs in packages/config

Day 3-4:
☐ Set up Supabase project (get DB URL)
☐ Write full Prisma schema (all tables from doc 05)
☐ Run first migration: npx prisma migrate dev
☐ Set up pgvector extension in Supabase
☐ Seed development data

Day 5-7:
☐ Integrate Clerk in web app (middleware, auth pages)
☐ Build NestJS ClerkGuard (JWT validation)
☐ POST /auth/webhook → create user in DB
☐ GET /auth/me → return current user
☐ Test auth end-to-end
```

#### Week 2: Core CRUD
```
Day 8-10:
☐ Build /projects CRUD (controller + service + DTOs)
☐ Build /conversations POST + GET (extension will use this)
☐ Build /messages: save messages under conversations
☐ Add usage limit checks (plan-based limits)

Day 11-14:
☐ Build /memories CRUD (controller + service + DTOs)
☐ Build memory suggestion endpoints (create, approve, reject)
☐ Add BullMQ setup (Redis, queues, basic processor)
☐ Connect extraction queue: after conversation saved → queue extraction job
☐ Test all endpoints with Postman/Thunder Client
```

### Phase 2: Extension MVP (Weeks 3–4)

**Goal:** Extension captures chats, saves locally, syncs to API.

#### Week 3: Extension Foundation
```
Day 15-17:
☐ Init Plasmo project (apps/extension)
☐ Set up Dexie.js (IndexedDB) with tables: conversations, messages, memories, sync_queue
☐ Build popup UI (user status, sync status, open dashboard)
☐ Build auth flow: connect extension to account via token
☐ Extension calls GET /auth/me to verify token works

Day 18-21:
☐ Build ChatGPT adapter (DOM capture logic)
☐ Build Claude adapter (DOM capture logic)
☐ Test capture: send message → conversation saved to IndexedDB
☐ Build background.ts sync loop (every 5 min: push to API)
☐ POST /sync/push → save conversations + messages to DB
```

#### Week 4: Sidebar UI
```
Day 22-24:
☐ Build Sidebar React component (Plasmo content script)
☐ InjectTab: show relevant memories, inject button
☐ CaptureTab: save current chat, assign project
☐ MemoryTab: list memories for current project

Day 25-28:
☐ Build Gemini adapter
☐ Platform auto-detection (registry.ts)
☐ Test extension on all 3 platforms
☐ Handle offline queue (save locally, sync when online)
☐ Extension badge counter for pending suggestions
```

### Phase 3: AI Memory Engine (Weeks 5–6)

**Goal:** AI extracts structured memories from conversations.

#### Week 5: Extraction Pipeline
```
Day 29-31:
☐ Build AI provider abstraction layer (ai.service.ts)
☐ Integrate Anthropic SDK (Claude Haiku for extraction)
☐ Write extraction prompt (structured JSON output)
☐ Build extraction.processor.ts (BullMQ job handler)
☐ Test: save conversation → job runs → suggestions created

Day 32-35:
☐ Build memory scoring logic (scoring.service.ts)
☐ Scoring formula: type weight + recency + mention frequency + user boost
☐ Build GET /memories/suggestions endpoint
☐ Build POST /memories/:id/approve and /reject
☐ Extension approval UI: notification badge → review modal
```

#### Week 6: Embeddings + Semantic Search
```
Day 36-38:
☐ Integrate OpenAI embeddings (text-embedding-3-small)
☐ Build embedding.processor.ts: on memory approved → generate embedding
☐ Store embedding in pgvector column (raw SQL via Prisma $queryRaw)
☐ Build semantic search query (cosine similarity)

Day 39-42:
☐ Build /search endpoint (keyword + semantic + hybrid)
☐ Build Search page in web dashboard
☐ Build SearchBar component with type toggle
☐ Test: "show my animation workflows" → correct memories returned
```

### Phase 4: Web Dashboard (Weeks 7–8)

**Goal:** Full dashboard with all pages functional.

#### Week 7: Core Pages
```
Day 43-45:
☐ Dashboard layout (sidebar + topbar + responsive)
☐ Home page (stats cards, recent projects, pending approvals)
☐ Projects page (grid, create modal, filter, sort)
☐ Single project page (memories tab, conversations tab)

Day 46-49:
☐ Memory Vault page (filters, list, approval banner)
☐ Conversations page (list, filter by platform/project)
☐ Single conversation page (transcript + extracted memories panel)
☐ Approval modal (step through suggestions)
```

#### Week 8: Settings + Billing
```
Day 50-52:
☐ Settings pages (profile, integrations, privacy)
☐ Export data feature (ZIP download)
☐ Delete account flow

Day 53-56:
☐ Integrate Stripe (checkout, customer portal, webhooks)
☐ Billing page with usage meters
☐ Plan upgrade/downgrade flow
☐ Usage limit enforcement on API (return 402 when over limit)
☐ PostHog analytics integration
```

### Phase 5: Polish + Launch (Weeks 9–10)

**Goal:** Production-ready, tested, launched.

```
Day 57-60:
☐ Context injection engine (/inject/build endpoint)
☐ Extension injection button: calls API → formats context → injects into textarea
☐ Token estimation display
☐ Onboarding flow (4 steps)

Day 61-63:
☐ Error tracking (Sentry frontend + backend)
☐ Rate limiting on all endpoints
☐ Security audit (OWASP checklist)
☐ E2E tests (Playwright for critical flows)

Day 64-70:
☐ Landing page (full design, Framer Motion)
☐ Submit to Chrome Web Store
☐ Set up domain + DNS
☐ Deploy: Vercel (web) + Railway (API) + Supabase (DB)
☐ Product Hunt launch preparation
☐ Beta invite list outreach
```

---

## 4. Development Commands

```bash
# Install all dependencies
pnpm install

# Run all apps in development
pnpm dev

# Run specific app
pnpm --filter web dev
pnpm --filter api dev
pnpm --filter extension dev

# Database
pnpm prisma migrate dev --name "init"
pnpm prisma generate
pnpm prisma db seed
pnpm prisma studio

# Type checking
pnpm typecheck

# Lint
pnpm lint

# Build for production
pnpm build

# Extension: build for Chrome
pnpm --filter extension build
```

---

## 5. Environment Variables

### Web App (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_POSTHOG_KEY=
```

### API (.env)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENTRY_DSN=
PORT=3001
```

### Extension (.env)
```
PLASMO_PUBLIC_API_URL=http://localhost:3001
PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY=
```

---

## 6. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm typecheck

  lint:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm lint

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
      redis:
        image: redis:7
    steps:
      - run: pnpm test

  deploy-api:
    if: github.ref == 'refs/heads/main'
    needs: [typecheck, lint, test]
    # Deploy to Railway

  deploy-web:
    if: github.ref == 'refs/heads/main'
    # Deploy to Vercel (auto via Vercel GitHub integration)
```

---

## 7. Agent Build Instructions

When giving this to an AI coding agent, use this order:

```
STEP 1: Read all 7 docs completely before writing any code.

STEP 2: Monorepo setup
  - Init Turborepo + pnpm workspaces
  - Create 3 apps (web, api, extension)
  - Create 4 packages (types, ui, utils, config)
  - Set up shared tsconfig, eslint, tailwind

STEP 3: Database
  - Set up Supabase project
  - Write Prisma schema exactly as in 05-BACKEND-SCHEMA.md
  - Run migration, enable pgvector
  - Write seed.ts

STEP 4: API - Auth first
  - NestJS bootstrap with Swagger
  - Clerk guard + webhook endpoint
  - GET /auth/me

STEP 5: API - Core CRUD
  - Projects module
  - Conversations + Messages module
  - Memories + Suggestions module
  - BullMQ setup

STEP 6: Extension - Foundation
  - Plasmo init
  - Dexie storage setup
  - Auth token management
  - Popup UI

STEP 7: Extension - Capture
  - ChatGPT adapter
  - Claude adapter
  - Sidebar UI (3 tabs)

STEP 8: AI Engine
  - AI provider abstraction
  - Extraction pipeline + queue
  - Scoring logic
  - Embeddings + pgvector

STEP 9: Search
  - Keyword search
  - Semantic search
  - Hybrid search endpoint

STEP 10: Web Dashboard
  - Layout + navigation
  - Home, Projects, Memories, Conversations pages
  - Approval modal

STEP 11: Billing + Analytics
  - Stripe integration
  - Usage tracking
  - PostHog

STEP 12: Polish
  - Error handling everywhere
  - Rate limiting
  - Onboarding flow
  - Landing page

IMPORTANT: 
- Never skip type definitions — use packages/types for shared types
- Always add user_id scoping to every DB query
- Handle errors gracefully (no unhandled promise rejections)
- Extension must work offline-first
```
