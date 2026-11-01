# MemoryOS — Technical Requirements Document (TRD)
**Version:** 1.0  
**Status:** Foundation Draft

---

## 1. Technology Stack

### 1.1 Frontend — Web Dashboard

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 15 (App Router) | SSR, API routes, file-based routing |
| Language | TypeScript 5.x | Type safety across full stack |
| Styling | TailwindCSS 3.x | Utility-first, fast iteration |
| UI Components | Shadcn/UI | Accessible, composable, copy-paste |
| State (server) | TanStack Query v5 | Caching, sync, mutations |
| State (client) | Zustand | Lightweight global state |
| Forms | React Hook Form + Zod | Validation + type-safe schemas |
| Charts | Recharts | Memory analytics, usage graphs |
| Graph Viz | React Flow | Knowledge graph (Phase 5) |
| Animation | Framer Motion | Micro-interactions, page transitions |
| Icons | Lucide React | Consistent icon system |

### 1.2 Browser Extension

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Plasmo | Best modern extension framework, hot reload |
| Language | TypeScript | Shared types with backend |
| UI | React + TailwindCSS | Sidebar panel, popup |
| Storage (local) | IndexedDB (via Dexie.js) | Structured local DB, fast queries |
| Messaging | Chrome Extension Message API | Background ↔ Content ↔ Popup |
| Build | Plasmo build (webpack) | Handles MV3 complexity |

### 1.3 Backend — API Server

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | NestJS (Node.js) | Enterprise-grade, modular, TypeScript-native |
| Language | TypeScript | Full-stack type sharing |
| ORM | Prisma | Type-safe DB queries, migration system |
| Validation | class-validator + class-transformer | DTO validation on all routes |
| API Style | REST + WebSocket (for real-time) | REST for CRUD, WS for live sync |
| Documentation | Swagger (via @nestjs/swagger) | Auto-generated API docs |

### 1.4 Database

| Layer | Technology | Reason |
|-------|-----------|--------|
| Primary DB | PostgreSQL 16 | Relational, reliable, supports pgvector |
| Vector Search | pgvector extension | Semantic search without Pinecone |
| Cache | Redis 7 | Session cache, rate limiting, queue |
| Queue | BullMQ (Redis-backed) | Background jobs (extraction, sync) |
| Local DB (ext) | IndexedDB via Dexie.js | Offline-first extension storage |

### 1.5 Auth

| Layer | Technology | Reason |
|-------|-----------|--------|
| Auth Provider | Clerk | Fastest implementation, MFA, social login |
| Session | Clerk JWT | Stateless, validated on each request |
| Extension Auth | Clerk session token shared via storage | Same user, same session |

### 1.6 AI Layer

| Purpose | Model | Reason |
|---------|-------|--------|
| Memory extraction | Claude Haiku 3.5 | Fast, cheap, great at structured extraction |
| Embeddings | text-embedding-3-small (OpenAI) | Best quality/cost for vectors |
| Fallback extraction | GPT-4o Mini | Redundancy |
| Summaries | Claude Haiku | Speed + cost |
| Complex reasoning | Claude Sonnet (on demand) | High-stakes memory decisions |

**Provider Abstraction Layer:**
```typescript
interface AIProvider {
  extract(text: string): Promise<Memory[]>;
  embed(text: string): Promise<number[]>;
  summarize(conversation: Message[]): Promise<string>;
}

class ClaudeProvider implements AIProvider { ... }
class OpenAIProvider implements AIProvider { ... }
class GeminiProvider implements AIProvider { ... }
```

### 1.7 Storage & Infrastructure

| Layer | Technology |
|-------|-----------|
| File storage | Supabase Storage (for exports, uploads) |
| Cloud hosting | Vercel (Next.js frontend) |
| API hosting | Railway or Render (NestJS backend) |
| DB hosting | Supabase (PostgreSQL managed) |
| CDN | Cloudflare |
| Analytics | PostHog (self-hosted or cloud) |
| Error tracking | Sentry |
| Payments | Stripe |
| Emails | Resend |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  BROWSER LAYER                      │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │  Extension   │    │   Web Dashboard (Next.js) │   │
│  │  (Plasmo)    │    │   memoryos.ai             │   │
│  └──────┬───────┘    └────────────┬─────────────┘   │
└─────────┼──────────────────────────┼─────────────────┘
          │  HTTPS / WS              │ HTTPS
          ▼                          ▼
┌─────────────────────────────────────────────────────┐
│              API LAYER (NestJS)                     │
│  /auth  /memories  /projects  /conversations        │
│  /search  /inject  /sync  /billing  /analytics     │
└─────────┬───────────────────────────────────────────┘
          │
    ┌─────┴──────────────────────────┐
    │                                │
    ▼                                ▼
┌───────────────┐          ┌─────────────────────┐
│  PostgreSQL   │          │     Redis + BullMQ   │
│  + pgvector   │          │   (Queue + Cache)    │
└───────────────┘          └─────────────────────┘
          │
    ┌─────┴──────────┐
    │                │
    ▼                ▼
┌─────────┐    ┌──────────────┐
│  Claude │    │   OpenAI     │
│  Haiku  │    │   Embeddings │
└─────────┘    └──────────────┘
```

---

## 3. API Routes

### 3.1 Auth Routes
```
POST   /auth/webhook              # Clerk webhook (user created/updated)
GET    /auth/me                   # Current user profile
PATCH  /auth/me                   # Update profile
```

### 3.2 Projects Routes
```
GET    /projects                  # List all user projects
POST   /projects                  # Create project
GET    /projects/:id              # Get single project
PATCH  /projects/:id              # Update project
DELETE /projects/:id              # Delete project
GET    /projects/:id/stats        # Memory count, conversation count
GET    /projects/:id/memories     # All memories for project
GET    /projects/:id/conversations # All conversations for project
```

### 3.3 Conversations Routes
```
GET    /conversations             # List (paginated, filter by project)
POST   /conversations             # Save new conversation (from extension)
GET    /conversations/:id         # Get single conversation
DELETE /conversations/:id         # Delete
POST   /conversations/:id/extract # Trigger memory extraction
GET    /conversations/:id/summary # Get/generate AI summary
PATCH  /conversations/:id/project # Assign to project
```

### 3.4 Memories Routes
```
GET    /memories                  # List all memories (paginated, filtered)
POST   /memories                  # Create memory manually
GET    /memories/:id              # Get single memory
PATCH  /memories/:id              # Update memory
DELETE /memories/:id              # Delete memory
POST   /memories/:id/approve      # Approve suggested memory
POST   /memories/:id/reject       # Reject suggested memory
GET    /memories/suggestions      # Get pending approval queue
POST   /memories/bulk-approve     # Approve multiple
```

### 3.5 Search Routes
```
GET    /search?q=&type=&project=  # Universal search
GET    /search/semantic?q=        # Vector-only search
GET    /search/suggest?q=         # Autocomplete suggestions
```

### 3.6 Injection Routes
```
POST   /inject/build              # Build context package for injection
Body: { platform, project_id, topic, max_tokens }
Response: { context_string, memories_used, token_count }
```

### 3.7 Sync Routes (Extension)
```
POST   /sync/push                 # Extension pushes queued data
GET    /sync/pull                 # Extension pulls latest memories
GET    /sync/status               # Last sync timestamp
```

### 3.8 Billing Routes
```
GET    /billing/plans             # Available plans
GET    /billing/subscription      # Current subscription
POST   /billing/checkout          # Create Stripe checkout session
POST   /billing/portal            # Stripe customer portal
POST   /billing/webhook           # Stripe webhook
GET    /billing/usage             # Current usage vs limits
```

### 3.9 Analytics Routes
```
GET    /analytics/overview        # Dashboard stats
GET    /analytics/tokens-saved    # Estimated token savings
GET    /analytics/memory-growth   # Memory count over time
GET    /analytics/platform-usage  # ChatGPT vs Claude vs Gemini breakdown
```

---

## 4. Data Transfer Objects (DTOs)

### CreateConversationDto
```typescript
class CreateConversationDto {
  @IsString() platform: 'chatgpt' | 'claude' | 'gemini' | 'grok';
  @IsOptional() @IsUUID() project_id?: string;
  @IsArray() messages: MessageDto[];
  @IsString() session_url: string;
  @IsDateString() started_at: string;
  @IsDateString() ended_at: string;
}

class MessageDto {
  @IsEnum(['user', 'assistant']) role: string;
  @IsString() content: string;
  @IsDateString() timestamp: string;
}
```

### CreateMemoryDto
```typescript
class CreateMemoryDto {
  @IsEnum(MemoryType) type: MemoryType;
  @IsString() content: string;
  @IsObject() structured_data: Record<string, any>;
  @IsOptional() @IsUUID() project_id?: string;
  @IsOptional() @IsUUID() conversation_id?: string;
  @IsArray() @IsString({ each: true }) tags: string[];
  @IsNumber() @Min(0) @Max(100) score: number;
}
```

### BuildInjectionDto
```typescript
class BuildInjectionDto {
  @IsEnum(Platform) platform: Platform;
  @IsOptional() @IsUUID() project_id?: string;
  @IsOptional() @IsString() topic?: string;
  @IsNumber() @Max(4000) max_tokens: number;
}
```

---

## 5. Extension Architecture

### 5.1 Extension Scripts

```
Extension
├── background.ts          # Service worker: sync, auth, state
├── content/
│   ├── index.ts           # Injected into AI platform pages
│   ├── adapters/
│   │   ├── chatgpt.ts     # ChatGPT DOM adapter
│   │   ├── claude.ts      # Claude DOM adapter
│   │   ├── gemini.ts      # Gemini DOM adapter
│   │   └── base.ts        # Base adapter interface
│   └── sidebar/
│       └── SidebarApp.tsx # React sidebar UI
├── popup/
│   └── PopupApp.tsx       # Extension popup
└── options/
    └── OptionsApp.tsx     # Extension settings page
```

### 5.2 Platform Adapters

Each adapter implements:
```typescript
interface PlatformAdapter {
  platform: Platform;
  detectConversation(): ConversationCapture | null;
  observeNewMessages(callback: (msg: Message) => void): void;
  injectContext(context: string): void;
  detectProject(): string | null;
}
```

**ChatGPT Adapter — Key Selectors (MV3-safe):**
```typescript
const SELECTORS = {
  messageContainer: '[data-message-author-role]',
  userMessage: '[data-message-author-role="user"]',
  assistantMessage: '[data-message-author-role="assistant"]',
  promptTextarea: '#prompt-textarea',
  conversationTitle: 'title'
};
```

**Claude Adapter — Key Selectors:**
```typescript
const SELECTORS = {
  humanTurn: '[data-testid="human-turn"]',
  assistantTurn: '[data-testid="assistant-turn"]',
  promptTextarea: '[contenteditable="true"]',
};
```

### 5.3 Offline-First Sync

```
Extension captures chat
     ↓
Stored in IndexedDB (immediate)
     ↓
Background: check internet
  ├── Online → push to API → mark synced
  └── Offline → queue in sync_queue table
                    ↓
                Retry on reconnect
```

---

## 6. Memory Extraction Pipeline

### 6.1 Extraction Prompt (Claude Haiku)

```
System: You are a memory extraction engine. Extract structured facts from this conversation.
Return ONLY valid JSON array. No explanation.

Schema:
[{
  "type": "personal|preference|tool|project|workflow|decision|template|entity",
  "content": "Human-readable summary",
  "structured_data": { key-value pairs },
  "tags": ["tag1", "tag2"],
  "confidence": 0.0-1.0,
  "score": 0-100
}]

Rules:
- Only extract concrete, reusable facts
- Skip chitchat, greetings, filler
- Minimum confidence: 0.7
- Maximum 10 memories per conversation
```

### 6.2 Embedding Strategy

- Model: `text-embedding-3-small` (1536 dimensions)
- Stored in: `pgvector` column on `memories` table
- Content embedded: `{type}: {content} | tags: {tags}`
- Updated: On creation and on edit

### 6.3 Similarity Search Query

```sql
SELECT m.*, 
  1 - (m.embedding <=> $1::vector) AS similarity
FROM memories m
WHERE m.user_id = $2
  AND m.project_id = $3
ORDER BY similarity DESC
LIMIT 20;
```

---

## 7. Security Architecture

### 7.1 Auth Flow

```
User signs up → Clerk creates user
Clerk fires webhook → Our /auth/webhook creates user in DB
User logs in → Clerk issues JWT
JWT sent with every API request → NestJS validates via Clerk SDK
User ID extracted → Scopes all queries to that user
```

### 7.2 Data Isolation

- Every DB query includes `WHERE user_id = :currentUserId`
- Extension auth: Clerk session token stored in `chrome.storage.local`
- No user can access another user's data (enforced at ORM level)

### 7.3 Encryption

| Layer | Method |
|-------|--------|
| Data in transit | TLS 1.3 |
| Cloud DB | AES-256 (Supabase default) |
| Local extension data | IndexedDB (not encrypted by default in Phase 1; encrypted vault in Phase 3) |

### 7.4 Rate Limiting

```typescript
// Per user, per endpoint
@UseGuards(RateLimitGuard)
@RateLimit({ ttl: 60, limit: 100 }) // 100 requests/minute
```

- AI extraction: 50 extractions/day (free), unlimited (pro)
- Search: 200 queries/minute
- Sync: 1 push/30 seconds

---

## 8. Queue Architecture (BullMQ)

### 8.1 Queues

| Queue | Purpose | Priority |
|-------|---------|----------|
| `memory-extraction` | Process captured chats for memory extraction | High |
| `embeddings` | Generate vector embeddings for new memories | High |
| `cloud-sync` | Sync extension data to cloud | Medium |
| `email` | Transactional emails | Medium |
| `analytics` | Update usage stats | Low |

### 8.2 Job Examples

```typescript
// memory-extraction job
interface ExtractionJob {
  conversation_id: string;
  user_id: string;
  messages: Message[];
}

// embeddings job
interface EmbeddingJob {
  memory_id: string;
  content: string;
}
```

---

## 9. Third-Party API Integrations

| Service | Purpose | SDK |
|---------|---------|-----|
| Anthropic Claude | Memory extraction, summaries | `@anthropic-ai/sdk` |
| OpenAI | Embeddings, fallback extraction | `openai` |
| Stripe | Payments, subscriptions | `stripe` |
| Clerk | Authentication | `@clerk/nextjs`, `@clerk/backend` |
| Resend | Transactional email | `resend` |
| PostHog | Product analytics | `posthog-node` |
| Sentry | Error tracking | `@sentry/nextjs` |
| Supabase Storage | File exports | `@supabase/supabase-js` |

---

## 10. Performance Requirements

| Metric | Requirement |
|--------|-------------|
| API response (p95) | < 200ms for simple reads |
| Search (semantic) | < 500ms |
| Memory extraction | < 3s per conversation |
| Extension sidebar render | < 100ms |
| Chat capture (no delay) | < 50ms (async, non-blocking) |
| DB query timeout | 5s max |
| Background sync interval | Every 5 minutes when online |

---

## 11. Monitoring & Observability

- **Errors:** Sentry (frontend + backend)
- **Performance:** PostHog + Vercel Analytics
- **Logs:** Railway structured logs
- **Uptime:** Better Uptime or Checkly
- **DB health:** Supabase dashboard
- **Queue health:** BullMQ dashboard (bull-board)

---

## 12. Extension Permissions (Chrome MV3)

```json
{
  "permissions": [
    "storage",
    "alarms",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://chat.openai.com/*",
    "https://claude.ai/*",
    "https://gemini.google.com/*",
    "https://grok.x.ai/*",
    "https://api.memoryos.ai/*"
  ]
}
```

**Justification for store review:**
- `storage`: Save memories locally
- `scripting`: Inject sidebar into AI platforms
- Host permissions: Only the AI platforms we integrate + our own API
