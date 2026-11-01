# MemoryOS 🧠

> **The Universal AI Memory Layer.**  
> *Your AI remembers every project, across every model.*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![NestJS 11](https://img.shields.io/badge/NestJS-11.0-E0234E?style=flat&logo=nestjs)](https://nestjs.com/)
[![Plasmo MV3](https://img.shields.io/badge/Plasmo-MV3-000000?style=flat&logo=googlechrome)](https://www.plasmo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![pgvector](https://img.shields.io/badge/pgvector-HNSW-blue?style=flat)](https://github.com/pgvector/pgvector)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?style=flat&logo=redis)](https://redis.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat&logo=turborepo)](https://turbo.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=flat&logo=clerk)](https://clerk.com/)

---

## 💡 The Problem

Power users of AI tools—developers, founders, researchers, and creators—spend thousands of tokens every week re-explaining the same context:

- **ChatGPT** memory is limited, chat-isolated, and lacks cross-project organization.
- **Claude Projects** are locked inside Anthropic's ecosystem with no cross-platform sharing.
- **Gemini** and other models live in completely separate silos.

When you switch between Claude and ChatGPT, your AI loses all memory of your architecture, styling guidelines, decisions, and workflows.

**MemoryOS solves this permanently.** A lightweight Chrome extension sits unobtrusively in your AI prompt bar, captures conversations, extracts structured memories (facts, preferences, decisions, workflows), indexes them in **pgvector**, and injects relevant context into any new session with a single click.

---

## 🏛️ Architecture Overview

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

## ✨ Core Features

- **🧠 Native Prompt Bar Injector**: Inserts an elegant, native `🧠 Memory` button directly inside the prompt toolbar of Claude and ChatGPT. No layout-disrupting sidebars or page pushes.
- **⚡ One-Click Context Injection**: Click "Find & Inject" to retrieve relevant memories and prepend them formatted directly into your active prompt textarea.
- **🔍 Semantic Vector Search**: Powered by PostgreSQL `pgvector` with HNSW cosine distance indexing (`<=>`), combined with custom score weighting.
- **🤖 Structured AI Memory Extraction**: Automatically categorizes conversation insights into 8 strict taxonomies (`personal`, `preference`, `tool`, `project`, `workflow`, `decision`, `template`, `entity`) using Gemini.
- **🛡️ Asynchronous BullMQ Pipelines**: Offloads heavy LLM extraction and vector generation to background worker queues backed by Redis.
- **🔒 Zero Cross-Tenant Leakage**: Every query across Prisma and raw pgvector SQL is strictly scoped to the authenticated caller's UUID.

---

## 📦 Monorepo Structure

```
MemoryOS/
├── apps/
│   ├── api/             # NestJS 11 REST API & BullMQ background workers
│   ├── web/             # Next.js 15 App Router web dashboard
│   └── extension/       # Plasmo MV3 Chrome extension & toolbar injector
├── packages/
│   ├── config/          # Shared ESLint, TSConfig, and Tailwind configs
│   ├── queue/           # BullMQ queue tokens & types
│   ├── types/           # Shared TypeScript domain models
│   ├── ui/              # Shared component library
│   └── utils/           # Shared helpers & formatters
├── prisma/
│   ├── schema.prisma    # PostgreSQL & pgvector schema
│   ├── migrations/      # Versioned database migrations
│   └── seed.ts          # Seed script for initial workspace & memories
├── context/             # Foundational product specifications (PRD, TRD, etc.)
├── docs/                # Comprehensive developer documentation & API specs
└── scripts/             # Local developer tools (Redis runner, DB checks)
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** `v20+`
- **pnpm** `v9.1.0+`
- **PostgreSQL 16** with `pgvector` enabled (e.g. Supabase)
- **Redis 6+** (built-in Windows runner included)

### 2. Clone & Install
```bash
git clone https://github.com/GauravFrr/MemoryOs.git
cd MemoryOs
pnpm install
```

### 3. Setup Environment Variables
Create a `.env` file at the root:
```bash
cp .env.example .env
```
Fill in your credentials:
- `DATABASE_URL`: PostgreSQL connection string with `pgvector`
- `GEMINI_API_KEYS`: Comma-separated Gemini API keys
- `CLERK_SECRET_KEY` & `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk Auth keys
- `REDIS_URL`: `redis://localhost:6379`

### 4. Database Setup & Verification
```bash
# Generate Prisma client
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Seed sample projects and memories
pnpm db:seed

# Verify database connection and pgvector
pnpm db:verify
```

### 5. Start Redis
```bash
# Windows (automatic local dev runner)
pnpm redis:dev

# Or with Docker
docker compose up -d
```

### 6. Run All Applications
```bash
pnpm dev
```
- **Web Dashboard**: `http://localhost:3000`
- **API Server**: `http://localhost:3001`
- **Swagger API Docs**: `http://localhost:3001/api`

---

## 🧩 Loading the Chrome Extension

1. Run the extension build watcher:
   ```bash
   pnpm --filter @memoryos/extension dev
   ```
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select:
   `apps/extension/build/chrome-mv3-dev`
5. Open [Claude](https://claude.ai) or [ChatGPT](https://chatgpt.com) to see the injected **🧠 Memory** button in your prompt bar.

---

## 📖 Complete Documentation

| Guide | Description |
|:---|:---|
| 📐 **[System Architecture](docs/ARCHITECTURE.md)** | Deep dive into services, data flow, BullMQ workers, and design principles. |
| 🔌 **[API Reference](docs/API_REFERENCE.md)** | Complete REST endpoints, DTO schemas, and response examples. |
| 🗄️ **[Database & pgvector Schema](docs/DATABASE_SCHEMA.md)** | PostgreSQL tables, Prisma schema, HNSW indexes, and migrations. |
| 🧠 **[AI Engine Guide](docs/AI_ENGINE.md)** | Gemini extraction, 768-dim embeddings, and context assembly engine. |
| 🧩 **[Extension Architecture](docs/EXTENSION_GUIDE.md)** | Plasmo content script injectors, Claude/ChatGPT adapters, and auth sync. |
| 💻 **[Developer Setup Guide](docs/DEVELOPER_GUIDE.md)** | Local environment setup, Redis configs, scripts, and verification tools. |
| 🔒 **[Security & Privacy](docs/SECURITY_PRIVACY.md)** | Multi-tenant isolation, Clerk authentication, and secret hygiene. |
| 📋 **[Product Foundation Specifications](context/)** | Original PRD, TRD, UI/UX design briefs, and implementation roadmaps. |

---

## 🛠️ Verification & Diagnostics

```bash
# Test database connection & pgvector extension
pnpm db:verify

# Test BullMQ Redis queue connection & job processing
pnpm queue:verify

# Run TypeScript typechecks across all monorepo packages
pnpm typecheck

# Run linter across the entire codebase
pnpm lint
```

---

## 📄 License & Attribution

Developed by **GauravFrr** for the MemoryOS Project.  
All rights reserved.
