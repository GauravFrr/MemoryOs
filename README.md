<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/banner-light.svg">
    <img alt="MemoryOS Banner" src="assets/banner-light.svg" width="480">
  </picture>

  <p><strong>Universal AI memory layer across ChatGPT, Claude, Gemini, and beyond.</strong></p>
  
  <p>Captures conversations natively, extracts structured atomic memories across 8 taxonomies, indexes 768-dimensional vectors in PostgreSQL pgvector, and injects relevant project context into any new prompt session with a single click.</p>

  <p>
    <a href="https://github.com/GauravFrr/MemoryOs"><img src="https://img.shields.io/github/license/GauravFrr/MemoryOs?color=7C5CFC" alt="License" /></a>
    <a href="https://github.com/GauravFrr/MemoryOs"><img src="https://img.shields.io/github/languages/top/GauravFrr/MemoryOs?color=6366F1" alt="Languages" /></a>
    <a href="https://github.com/GauravFrr/MemoryOs/issues"><img src="https://img.shields.io/github/issues/GauravFrr/MemoryOs" alt="Issues" /></a>
    <a href="https://github.com/GauravFrr/MemoryOs/stargazers"><img src="https://img.shields.io/github/stars/GauravFrr/MemoryOs?color=38BDF8" alt="Stars" /></a>
  </p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js" alt="Next.js 15" /></a>
    <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-11.0-E0234E?style=flat&logo=nestjs" alt="NestJS 11" /></a>
    <a href="https://www.plasmo.com/"><img src="https://img.shields.io/badge/Plasmo-MV3-000000?style=flat&logo=googlechrome" alt="Plasmo MV3" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql" alt="PostgreSQL" /></a>
    <a href="https://github.com/pgvector/pgvector"><img src="https://img.shields.io/badge/pgvector-HNSW-blue?style=flat" alt="pgvector" /></a>
    <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-BullMQ-DC382D?style=flat&logo=redis" alt="BullMQ" /></a>
    <a href="https://turbo.build/"><img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat&logo=turborepo" alt="Turborepo" /></a>
  </p>

  <p>
    <a href="docs/README.md"><strong>📖 Documentation Hub</strong></a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-features">Features</a> •
    <a href="#-structured-memory-taxonomies-deep-dive">Taxonomies</a> •
    <a href="#-semantic-search--hybrid-ranking-formula">Vector Search</a> •
    <a href="#-native-browser-extension-architecture">Extension</a> •
    <a href="#-api-endpoints-quick-reference">API Reference</a> •
    <a href="#-local-setup--installation">Setup</a> •
    <a href="#-running-the-application">Running App</a>
  </p>
</div>

> 🧠 **Continuous Cross-Model Intelligence**: Stop re-explaining your project architecture, styling standards, and workflows every time you switch between Claude and ChatGPT. MemoryOS saves 50,000–200,000 redundant context tokens per user every month.

---

### Features

<table>
  <tr>
    <td width="33%"><strong>🧠 Native Toolbar Injector</strong><br>Inserts seamlessly into Claude's & ChatGPT's prompt toolbars. Zero layout-disrupting sidebars or page pushes.</td>
    <td width="33%"><strong>⚡ One-Click Injection</strong><br>Builds concise Markdown context from semantic vectors and recency, prepending directly to the active prompt.</td>
    <td width="33%"><strong>🔍 pgvector HNSW Search</strong><br>Sub-millisecond approximate nearest neighbor (ANN) retrieval using cosine distance over 768-dim embeddings.</td>
  </tr>
  <tr>
    <td width="33%"><strong>🤖 8-Taxonomy Extraction</strong><br>Gemini background workers parse dialogue into strict typed facts: preferences, decisions, workflows, and tools.</td>
    <td width="33%"><strong>🛡️ Zero Tenant Leakage</strong><br>Every Prisma query and raw SQL pgvector statement strictly enforces UUID user-ownership boundaries.</td>
    <td width="33%"><strong>⚡ Async BullMQ Queues</strong><br>Time-consuming extraction and embedding jobs are offloaded to Redis queues, keeping endpoints lightning fast.</td>
  </tr>
</table>

<details>
  <summary><strong>Table of Contents</strong></summary>
  <ul>
    <li><a href="#-system-architecture">🏗️ System Architecture</a></li>
    <li><a href="#-structured-memory-taxonomies-deep-dive">🧬 Structured Memory Taxonomies Deep Dive</a></li>
    <li><a href="#-semantic-search--hybrid-ranking-formula">⚡ Semantic Search &amp; Hybrid Ranking Formula</a></li>
    <li><a href="#-native-browser-extension-architecture">🧩 Native Browser Extension Architecture</a></li>
    <li><a href="#-api-endpoints-quick-reference">🛠️ API Endpoints Quick Reference</a></li>
    <li><a href="#-monorepo-structure">📦 Monorepo Structure</a></li>
    <li><a href="#-local-setup--installation">⚙️ Local Setup &amp; Installation</a></li>
    <li><a href="#-running-the-application">🚀 Running the Application</a></li>
    <li><a href="#-complete-documentation-suite">📚 Complete Documentation Suite</a></li>
  </ul>
</details>

---

## 🏗️ System Architecture

The following diagram outlines the end-to-end data lifecycle from browser capture to pgvector indexing and one-click injection:

```mermaid
graph TD
    subgraph Browser ["Client Layer (Browser)"]
        Platform["AI Chat Platform (Claude / ChatGPT)"]
        Injector["Plasmo DOM Injector"]
        Popover["MemoryPopover UI"]
        WebDashboard["Next.js 15 Web Dashboard"]
    end

    subgraph API ["NestJS 11 Backend API"]
        ClerkAuth["Clerk JWT Guard / Svix Webhooks"]
        InjectCtrl["InjectController (/inject/build)"]
        SearchSvc["SearchService (pgvector HNSW)"]
        ConversationsCtrl["ConversationsController (/conversations)"]
        AiSvc["AiService (Gemini Integration)"]
    end

    subgraph Queue ["Asynchronous Pipeline"]
        BullMQ["BullMQ on Redis 7"]
        ExtractWorker["MemoryExtractionProcessor"]
        EmbedWorker["EmbeddingsProcessor"]
    end

    subgraph Storage ["PostgreSQL 16 Persistence (Supabase)"]
        Postgres["Postgres Tables (users, projects, conversations)"]
        PgVector["pgvector (768-dim HNSW Cosine Index)"]
    end

    %% Interactions
    Platform -->|"Mounts button"| Injector
    Injector -->|"Opens on click"| Popover
    Popover -->|"POST /inject/build"| InjectCtrl
    Platform -->|"Auto-sync chat"| ConversationsCtrl
    WebDashboard -->|"Dashboard CRUD"| API

    ConversationsCtrl -->|"Enqueue job"| BullMQ
    BullMQ --> ExtractWorker
    BullMQ --> EmbedWorker
    ExtractWorker -->|"8-Taxonomy Extraction"| AiSvc
    EmbedWorker -->|"Generate 768-dim Vector"| AiSvc

    InjectCtrl --> SearchSvc
    SearchSvc --> PgVector
    AiSvc -->|"Read / Write"| Postgres
    EmbedWorker -->|"Store embeddings"| PgVector
```

### Key Engineering Features

1. **Native Toolbar Anchoring**: Unlike legacy extensions that force fixed sidebars and disrupt fluid chat interfaces, MemoryOS inserts a clean `🧠 Memory` button directly inside Claude's `<fieldset>` footer or ChatGPT's `#prompt-textarea` form toolbar.
2. **Asynchronous BullMQ Pipelines**: LLM extraction and vector generation execute in background worker threads, preventing API timeouts and maintaining sub-100ms response times on conversation ingest.
3. **Multi-Key Pool & Rotation**: `AiService` cycles through comma-separated `GEMINI_API_KEYS` with exponential backoff and a model fallback chain (`gemini-3.5-flash` → `gemini-3.1-flash-lite` → `gemini-2.5-flash`) to ensure zero quota disruptions.
4. **Offline-First Dexie.js Caching**: Captures are buffered in browser IndexedDB before syncing to the cloud, guaranteeing no data loss during network hiccups.
5. **Strict Tenant Isolation**: All Prisma queries and raw pgvector SQL bindings include `$2::uuid` user constraints, making cross-tenant data leakage architecturally impossible.

---

## 🧬 Structured Memory Taxonomies Deep Dive

Conversations are parsed into an explicit JSON array categorized into **8 strict memory taxonomies**:

| Taxonomy | Scope & Purpose | Concrete Example |
|:---|:---|:---|
| **`personal`** | Factual user attributes | *"User is a full-stack engineer and solo founder based in Berlin."* |
| **`preference`** | Stylistic, coding, or workflow habits | *"Prefers TypeScript strict mode, functional React components, and TailwindCSS."* |
| **`tool`** | Software, frameworks, and SDKs | *"Uses Turborepo with pnpm workspaces, NestJS 11, and Prisma 6."* |
| **`project`** | Architecture and status of specific projects | *"MemoryOS: universal memory layer across ChatGPT, Claude, and Gemini."* |
| **`workflow`** | Operational steps or development habits | *"Deployments require passing GitHub Actions checks prior to merging."* |
| **`decision`** | Recorded architectural or design choices | *"Adopted PostgreSQL pgvector over Pinecone to eliminate external network hops."* |
| **`template`** | Reusable patterns, prompts, or snippets | *"Standard NestJS service unit test harness with mock PrismaService."* |
| **`entity`** | External companies, APIs, or collaborators | *"Supabase manages PostgreSQL and pgvector cloud infrastructure."* |

### Extraction JSON Schema
```json
[
  {
    "type": "preference",
    "content": "User enforces explicit UUID casting in raw PostgreSQL pgvector queries.",
    "metadata": {
      "confidence": 0.96,
      "context": "SearchService pgvector refactor"
    }
  }
]
```

---

## ⚡ Semantic Search & Hybrid Ranking Formula

When prompt context is requested, `SearchService` runs an approximate nearest neighbor (ANN) search using pgvector's HNSW cosine distance operator (`<=>`). Results are reranked using a calibrated hybrid formula combining vector similarity with user memory scores:

$$\text{Combined Score} = (1 - \text{Cosine Distance}) + \frac{\text{Score}}{100.0}$$

```sql
SELECT 
  m.id, 
  m.content, 
  1 - (m.embedding <=> $1::vector) AS similarity,
  (1 - (m.embedding <=> $1::vector)) + (m.score / 100.0) AS combined_score
FROM memories m
WHERE m.user_id = $2::uuid 
  AND (m.project_id = $3::uuid OR m.project_id IS NULL)
ORDER BY combined_score DESC, m.created_at DESC
LIMIT $4;
```

---

## 🧩 Native Browser Extension Architecture

The extension (`apps/extension`) is built on **Plasmo** and **React 18** under Manifest V3:

* **DOM Toolbar Injectors** (`contents/injector.tsx`): Locates the active composer toolbar, mounts an isolated React root, and displays the **🧠 Memory** trigger.
* **Platform Adapters** (`lib/adapters/claude.ts`, `lib/adapters/chatgpt.ts`): Normalizes differences across ProseMirror `contenteditable` divs and textarea inputs, dispatching synthetic input events to trigger platform React state updates.
* **Session Syncer** (`contents/auth-sync.ts`): Automatically synchronizes Clerk authentication tokens from the web dashboard into `chrome.storage.local` for seamless background API calls.

---

## 🛠️ API Endpoints Quick Reference

### 1. Build Context for Prompt (`POST /inject/build`)
Builds a formatted, token-budgeted Markdown context block:

```bash
curl -X POST "http://localhost:3001/inject/build" \
     -H "Authorization: Bearer <clerk_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "platform": "claude",
       "project_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
       "topic": "Tailwind dark mode styling rules",
       "mode": "combined",
       "session_url": "https://claude.ai/chat/abc-123",
       "max_tokens": 1500
     }'
```

**Response Payload:**
```json
{
  "context_string": "[MemoryOS Context — Project Alpha]\n• Always use HSL color tokens for dark mode themes.\n• Prefer Radix primitives for dialogs and popovers.\n\n[MemoryOS — This Chat]\n• 14 messages, UI Architecture Discussion\n• Refactored button injection to use native toolbar container.",
  "memories_used": 2,
  "token_estimate": 84
}
```

### 2. Ingest Conversation (`POST /conversations`)
Synchronizes chat turns and automatically triggers background memory extraction:

```bash
curl -X POST "http://localhost:3001/conversations" \
     -H "Authorization: Bearer <clerk_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "platform": "claude",
       "externalId": "chat-78901",
       "url": "https://claude.ai/chat/78901",
       "title": "Discussion on Vector Search Indexing",
       "messages": [
         { "role": "user", "content": "Let'\''s use HNSW indexes for pgvector." },
         { "role": "assistant", "content": "Agreed, HNSW delivers sub-millisecond retrieval." }
       ]
     }'
```

---

## 📦 Monorepo Structure

```
MemoryOS/
├── apps/
│   ├── api/             # NestJS 11 backend REST API & BullMQ processors
│   ├── web/             # Next.js 15 App Router web dashboard
│   └── extension/       # Plasmo MV3 Chrome extension & toolbar injector
├── packages/
│   ├── config/          # Shared ESLint, Prettier, Tailwind, and TSConfigs
│   ├── queue/           # BullMQ queue tokens & job definitions
│   ├── types/           # Shared TypeScript domain interfaces
│   ├── ui/              # Shared component library
│   └── utils/           # Shared helper functions
├── prisma/
│   ├── schema.prisma    # PostgreSQL & pgvector schema definition
│   ├── migrations/      # Version-controlled SQL migration scripts
│   └── seed.ts          # Seed script for initial workspace and memories
├── context/             # Foundational product specifications (PRD, TRD)
├── docs/                # Comprehensive technical documentation & guides
├── scripts/             # Local developer tools (Redis dev runner, DB checks)
├── turbo.json           # Turborepo task pipeline configuration
└── pnpm-workspace.yaml  # Workspace directory declarations
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
* **Node.js**: `v20.x` or later (LTS recommended)
* **pnpm**: `v9.1.0` or later (`npm install -g pnpm`)
* **PostgreSQL 16**: with `pgvector` and `uuid-ossp` extensions (Supabase recommended)
* **Redis**: Redis 6+ or 7+ (built-in Windows runner included)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/GauravFrr/MemoryOs.git
cd MemoryOs
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres:password@host:5432/postgres"
GEMINI_API_KEYS="your-first-key,your-second-key"
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

> [!IMPORTANT]
> **Gemini Free-Tier Quota & Multi-Key Rotation**  
> Google Gemini's free tier has a ceiling of **1,500 requests/day**. `AiService` automatically round-robins across comma-separated keys in `GEMINI_API_KEYS`. If you anticipate heavy testing, provide 2–3 keys separated by commas to avoid `429 Too Many Requests` errors.

### 3. Provision Database & Verify Setup
```bash
# Generate Prisma client bindings
pnpm db:generate

# Apply SQL migrations to PostgreSQL
pnpm db:migrate

# Seed sample workspace projects and memories
pnpm db:seed

# Verify database connection and pgvector extension
pnpm db:verify
```

---

## 🚀 Running the Application

### 1. Start Redis
```bash
# On Windows (uses built-in automated dev runner, no Docker required):
pnpm redis:dev

# Or using Docker (macOS / Linux):
docker compose up -d
```

Verify queue health:
```bash
pnpm queue:verify
```

### 2. Launch Dev Server
Launch all applications simultaneously with Turborepo:
```bash
pnpm dev
```

* **Web Dashboard**: `http://localhost:3000`
* **NestJS API Server**: `http://localhost:3001`
* **Swagger API Explorer**: `http://localhost:3001/api`

### 3. Load Extension in Chrome
1. In another terminal, ensure the extension build is running:
   ```bash
   pnpm --filter @memoryos/extension dev
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right toggle).
4. Click **Load unpacked** and select:
   `apps/extension/build/chrome-mv3-dev`
5. Open [Claude](https://claude.ai) or [ChatGPT](https://chatgpt.com) to test the injected **🧠 Memory** button.

---

## 📚 Complete Documentation Suite

For exhaustive engineering details, explore the [`/docs`](docs/README.md) directory:

- 📐 **[System Architecture](docs/ARCHITECTURE.md)**: Monorepo topologies, service diagrams, and data flows.
- 🔌 **[API Reference](docs/API_REFERENCE.md)**: Complete REST API documentation, DTO schemas, and response formats.
- 🗄️ **[Database & pgvector Schema](docs/DATABASE_SCHEMA.md)**: PostgreSQL models, HNSW index parameters, and migration history.
- 🧠 **[AI Engine Guide](docs/AI_ENGINE.md)**: Extraction prompts, 768-dim embeddings, and token budgeting.
- 🧩 **[Extension Guide](docs/EXTENSION_GUIDE.md)**: Plasmo MV3 setup, Claude & ChatGPT adapters, and auth sync.
- 💻 **[Developer Guide](docs/DEVELOPER_GUIDE.md)**: Monorepo commands, Redis workflows, and diagnostic tools.
- 🔒 **[Security & Privacy](docs/SECURITY_PRIVACY.md)**: User-scoped queries, Clerk JWT validation, and secret hygiene.
- 📋 **[Product Foundation Specifications](context/)**: Original PRD, TRD, UI/UX design brief, and roadmap.

---

<div align="center">
  <sub>Built by <a href="https://github.com/GauravFrr">GauravFrr</a> — Universal AI Memory Layer</sub>
</div>
