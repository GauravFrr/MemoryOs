# System Architecture & Technical Design

MemoryOS is architected as a high-performance, modular TypeScript monorepo managed via **Turborepo** and **pnpm workspaces**. It decouples browser-native context injection, background asynchronous AI pipelines, and user dashboard management.

---

## 1. Monorepo Structure

```
MemoryOS/
├── apps/
│   ├── api/             # NestJS 11 backend REST API & background processors
│   ├── web/             # Next.js 15 App Router web dashboard
│   └── extension/       # Plasmo MV3 Chrome extension & platform injectors
├── packages/
│   ├── config/          # Shared ESLint, Prettier, Tailwind, and TSConfigs
│   ├── queue/           # BullMQ queue name tokens and type definitions
│   ├── types/           # Core shared TypeScript domain interfaces
│   ├── ui/              # Shared React UI components (Radix / Tailwind)
│   └── utils/           # Shared helper functions and formatting utilities
├── prisma/
│   ├── schema.prisma    # Canonical database schema & pgvector configurations
│   ├── migrations/      # Version-controlled SQL migration scripts
│   └── seed.ts          # Seed data script for local testing
├── context/             # Foundational product & architecture specifications
├── docs/                # Comprehensive technical documentation & guides
├── scripts/             # Local developer tooling (Redis dev runner, DB verification)
├── turbo.json           # Turborepo task pipeline configuration
└── pnpm-workspace.yaml  # Workspace directory declarations
```

---

## 2. High-Level Component Topology

```mermaid
graph TD
    subgraph Browser ["Client Environment (Browser)"]
        ChatPlatform["AI Platforms (Claude / ChatGPT / Gemini)"]
        DOMInjector["Content Script: Native DOM Injector"]
        Popover["MemoryPopover UI (React)"]
        DexieDB["Local IndexedDB (Dexie.js)"]
        WebDashboard["apps/web: Next.js 15 Dashboard"]
    end

    subgraph API_Layer ["API Layer (apps/api - NestJS 11)"]
        ClerkAuth["Clerk JWT Guard / Svix Webhooks"]
        InjectCtrl["InjectController (/inject/build)"]
        MemoriesCtrl["MemoriesController (/memories)"]
        ProjectsCtrl["ProjectsController (/projects)"]
        SearchSvc["SearchService (pgvector HNSW)"]
        AiSvc["AiService (Gemini Integration)"]
    end

    subgraph Async_Layer ["Asynchronous Queue Pipeline"]
        RedisQueue["BullMQ on Redis 7"]
        ExtractionWorker["MemoryExtractionProcessor"]
        EmbeddingsWorker["EmbeddingsProcessor"]
    end

    subgraph Storage ["Persistent Persistence Layer"]
        Postgres["PostgreSQL 16 (Supabase)"]
        PgVector["pgvector (768-dim cosine distance)"]
    end

    %% Client Interactions
    ChatPlatform -->|"Mounts"| DOMInjector
    DOMInjector -->|"Opens"| Popover
    DOMInjector -->|"Offline Cache"| DexieDB
    Popover -->|"POST /inject/build"| InjectCtrl
    WebDashboard -->|"REST API / Clerk Auth"| API_Layer

    %% API Layer Internal Routing
    InjectCtrl --> SearchSvc
    InjectCtrl --> AiSvc
    MemoriesCtrl --> Postgres
    ProjectsCtrl --> Postgres
    SearchSvc --> PgVector

    %% Async Dispatch
    MemoriesCtrl -->|"Enqueue job"| RedisQueue
    RedisQueue --> ExtractionWorker
    RedisQueue --> EmbeddingsWorker
    ExtractionWorker -->|"Generate structured memory"| AiSvc
    EmbeddingsWorker -->|"Generate vector"| AiSvc
    EmbeddingsWorker -->|"Update vector"| PgVector
```

---

## 3. Core Operational Lifecycles

### Lifecycle A: Memory Extraction & Processing Pipeline

1. **Ingestion**: Conversations captured from supported AI platforms are posted to `/conversations`.
2. **Queueing**: The API pushes an extraction task to the `memory-extraction` BullMQ queue.
3. **AI Structured Extraction**: The `MemoryExtractionProcessor` invokes Google Gemini using an extraction prompt that parses dialogue into standardized structured objects (`personal`, `preference`, `tool`, `project`, `workflow`, `decision`, `template`, `entity`).
4. **Suggestion Generation**: Memories are saved in state `pending_review` (or auto-approved for verified workflows).
5. **Vector Embedding**: Upon memory approval, an embedding job is enqueued in the `embeddings` queue. The `EmbeddingsProcessor` generates a 768-dimensional vector via Gemini (`gemini-embedding-2` / `embedding-001`) and writes it to the `embedding` column on the `memories` table in PostgreSQL.

### Lifecycle B: Context Retrieval & Prompt Injection

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Toolbar as AI Prompt Toolbar (Claude/ChatGPT)
    participant Extension as Plasmo Content Script
    participant API as MemoryOS API (POST /inject/build)
    participant Search as SearchService (pgvector)
    participant LLM as Google Gemini (Embedding)

    User->>Toolbar: Clicks 🧠 Memory Button
    Toolbar->>Extension: Renders MemoryPopover
    User->>Extension: Selects Project & Clicks "Find & Inject"
    Extension->>API: POST /inject/build (topic, project_id, platform, max_tokens)
    
    alt Topic provided (Semantic Search)
        API->>LLM: Embed topic into 768-dim vector
        LLM-->>API: Vector array
        API->>Search: Cosine similarity query (HNSW <=> operator)
        Search-->>API: Top matching memories
    else No topic provided (Recency / Score Sort)
        API->>Search: Fetch top scored & recent memories
        Search-->>API: Top memories
    end

    API->>API: Format Markdown block & enforce token budget
    API-->>Extension: Formatted context block + stats
    Extension->>Toolbar: Injects context string directly into active prompt textarea
    Extension->>Extension: Displays success toast and auto-closes popover
```

---

## 4. Architectural Guarantees & Constraints

1. **Strict User Scoping (Tenant Isolation)**:
   - Every database query executed by `PrismaService` is strictly constrained by `WHERE user_id = currentUserId`.
   - Raw SQL pgvector queries explicitly require and cast the `user_id` as UUID (`WHERE user_id = $1::uuid`).
2. **Controller/Service Separation**:
   - NestJS controllers handle request routing, DTO validation, and response serialization.
   - All business logic, Prisma queries, and external API calls reside exclusively in injectable services.
3. **Decoupled Asynchronous Processing**:
   - Time-consuming LLM extraction and vector generation are offloaded to BullMQ workers. API endpoints return immediately with acknowledgement responses.
4. **Zero Page Push in Browser Extension**:
   - The Chrome extension mounts unobtrusively into native toolbars rather than creating fixed sidebars that disrupt Claude or ChatGPT responsive layout containers.
5. **Fallback Rotation for AI Services**:
   - The API supports comma-separated fallback API keys for Google Gemini to prevent disruption during quota throttling.
