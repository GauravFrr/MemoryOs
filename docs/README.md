# MemoryOS Documentation Hub

Welcome to the official developer and technical documentation for **MemoryOS** — the universal AI memory layer that seamlessly connects users' knowledge across all AI models (ChatGPT, Claude, Gemini, Grok, and beyond).

---

## 📚 Documentation Index

| Document | Description |
|:---|:---|
| **[System Architecture](file:///f:/MemoryOS/docs/ARCHITECTURE.md)** | Full-stack monorepo architecture, service diagrams, message pipelines, and data flows. |
| **[API Reference](file:///f:/MemoryOS/docs/API_REFERENCE.md)** | Complete REST API endpoint documentation, DTO schemas, authentication, and payload examples. |
| **[Database & Vector Store](file:///f:/MemoryOS/docs/DATABASE_SCHEMA.md)** | PostgreSQL schema, pgvector HNSW indexing, Prisma models, migrations, and relationship diagrams. |
| **[AI Engine & Injection](file:///f:/MemoryOS/docs/AI_ENGINE.md)** | Gemini extraction pipeline, 768-dim embeddings, semantic search, and context injection engine. |
| **[Chrome Extension Guide](file:///f:/MemoryOS/docs/EXTENSION_GUIDE.md)** | Plasmo MV3 setup, native DOM toolbar injection, Claude/ChatGPT adapters, and offline storage. |
| **[Developer Setup Guide](file:///f:/MemoryOS/docs/DEVELOPER_GUIDE.md)** | Monorepo setup, local environment variables, Redis configurations, database seeding, and verification. |
| **[Security & Privacy](file:///f:/MemoryOS/docs/SECURITY_PRIVACY.md)** | Tenant data isolation, user-scoped Prisma constraints, Clerk JWT validation, and encryption practices. |

---

## 🗂️ Foundation & Product Specifications (`/context`)

The foundational product definitions, flow diagrams, and original roadmap specifications are preserved in the [`/context`](file:///f:/MemoryOS/context) directory:

- **[01-PRD.md](file:///f:/MemoryOS/context/01-PRD.md)**: Product Requirements Document, user personas, problem statement, and module definitions.
- **[02-TRD.md](file:///f:/MemoryOS/context/02-TRD.md)**: Technical Requirements Document, core technology choices, and architectural goals.
- **[03-APP-FLOW.md](file:///f:/MemoryOS/context/03-APP-FLOW.md)**: Screen-by-screen application flows and state transitions.
- **[04-UI-UX-DESIGN-BRIEF.md](file:///f:/MemoryOS/context/04-UI-UX-DESIGN-BRIEF.md)**: Visual identity, color palette, design tokens, and component specifications.
- **[05-BACKEND-SCHEMA.md](file:///f:/MemoryOS/context/05-BACKEND-SCHEMA.md)**: Initial database specification, SQL DDL, and indexing design.
- **[06-IMPLEMENTATION-PLAN.md](file:///f:/MemoryOS/context/06-IMPLEMENTATION-PLAN.md)**: Multi-phase engineering roadmap and milestones.
- **[07-AI-RANKING-STRATEGY.md](file:///f:/MemoryOS/context/07-AI-RANKING-STRATEGY.md)**: Generative engine optimization (GEO), memory ranking, and growth strategy.

---

## ⚡ Quick Architecture Summary

```
                      ┌───────────────────────────────────────┐
                      │             CLIENT LAYER              │
                      │  Plasmo Extension (Claude / ChatGPT)  │
                      │  Next.js 15 Web Dashboard             │
                      └──────────────────┬────────────────────┘
                                         │ HTTPS / Clerk JWT
                                         ▼
                      ┌───────────────────────────────────────┐
                      │           API LAYER (NestJS)          │
                      │  Auth · Memories · Projects · Inject  │
                      │  Conversations · Search · Usage Logs  │
                      └──────────────┬─────────────────┬──────┘
                                     │                 │
                ┌────────────────────┴──┐   ┌──────────┴───────────────┐
                │ PostgreSQL + pgvector │   │      Redis + BullMQ      │
                │ Supabase / 768-dim    │   │  extraction / embeddings │
                └───────────────────────┘   └──────────┬───────────────┘
                                                       │
                                            ┌──────────┴───────────────┐
                                            │      Google Gemini       │
                                            │ Extraction & Embeddings  │
                                            └──────────────────────────┘
```

---

## 🛠️ Getting Started in 3 Commands

```bash
# 1. Install dependencies across all monorepo workspaces
pnpm install

# 2. Start local Redis server (auto-configured for Windows & Unix)
pnpm redis:dev

# 3. Launch all applications (API, Web, Extension) in dev mode
pnpm dev
```

For complete setup instructions, environment variable templates, and database migration steps, proceed to the **[Developer Setup Guide](file:///f:/MemoryOS/docs/DEVELOPER_GUIDE.md)**.
