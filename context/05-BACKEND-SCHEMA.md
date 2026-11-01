# MemoryOS — Backend Schema & Data Architecture
**Version:** 1.0

---

## 1. Database Overview

- **Engine:** PostgreSQL 16
- **Extensions:** `pgvector` (semantic search), `uuid-ossp` (UUID generation)
- **ORM:** Prisma
- **Hosting:** Supabase managed PostgreSQL

---

## 2. Entity Relationship Diagram

```
users
  │
  ├──< projects
  │       │
  │       ├──< conversations (many projects)
  │       └──< memories (many projects)
  │
  ├──< conversations
  │       │
  │       ├──< messages (belongs to conversation)
  │       └──< memory_suggestions (extracted from conversation)
  │
  ├──< memories
  │       │
  │       └──< memory_tags (many-to-many via pivot)
  │
  ├──< tags
  │
  ├──< subscriptions
  └──< usage_logs
```

---

## 3. Complete Table Definitions

### 3.1 users

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id        VARCHAR(255) UNIQUE NOT NULL,
  email           VARCHAR(255) UNIQUE NOT NULL,
  display_name    VARCHAR(255),
  avatar_url      TEXT,
  timezone        VARCHAR(100) DEFAULT 'UTC',
  plan            VARCHAR(50) DEFAULT 'free',
  
  -- Settings
  cloud_sync_enabled  BOOLEAN DEFAULT FALSE,
  analytics_enabled   BOOLEAN DEFAULT TRUE,
  
  -- Limits cache (updated by billing webhook)
  memory_limit        INTEGER DEFAULT 100,
  project_limit       INTEGER DEFAULT 3,
  extraction_limit    INTEGER DEFAULT 10,
  
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
```

### 3.2 projects

```sql
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name         VARCHAR(255) NOT NULL,
  description  TEXT,
  color        VARCHAR(7) DEFAULT '#7C5CFC',  -- Hex color
  icon         VARCHAR(50) DEFAULT '📁',       -- Emoji
  
  -- State
  status       VARCHAR(50) DEFAULT 'active',  -- active | archived
  
  -- Auto-detection hints (used by extension)
  keywords     TEXT[],  -- Keywords that map to this project
  platforms    VARCHAR(50)[],  -- ['chatgpt', 'claude', 'gemini']
  
  -- Cached stats (updated by triggers)
  memory_count       INTEGER DEFAULT 0,
  conversation_count INTEGER DEFAULT 0,
  
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);
```

### 3.3 conversations

```sql
CREATE TABLE conversations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Source info
  platform     VARCHAR(50) NOT NULL,  -- chatgpt | claude | gemini | grok
  session_url  TEXT,
  
  -- Content
  title        VARCHAR(500),          -- Auto-generated from first message
  summary      TEXT,                  -- AI-generated summary
  
  -- Stats
  message_count     INTEGER DEFAULT 0,
  memory_extracted  INTEGER DEFAULT 0,
  
  -- Sync state
  synced_at    TIMESTAMPTZ,
  sync_hash    VARCHAR(64),  -- Hash to detect changes
  
  started_at   TIMESTAMPTZ NOT NULL,
  ended_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_platform ON conversations(user_id, platform);
CREATE INDEX idx_conversations_started_at ON conversations(user_id, started_at DESC);
```

### 3.4 messages

```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  role            VARCHAR(20) NOT NULL,  -- user | assistant
  content         TEXT NOT NULL,
  
  -- For large content chunking (Phase 3)
  content_hash    VARCHAR(64),
  token_count     INTEGER,
  
  position        INTEGER NOT NULL,  -- Order in conversation
  timestamp       TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_position ON messages(conversation_id, position);

-- Partition by conversation for performance at scale
```

### 3.5 memories

```sql
CREATE TABLE memories (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id     UUID REFERENCES projects(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Type
  type           VARCHAR(50) NOT NULL,
  -- Enum: personal | preference | tool | project | workflow | decision | template | entity
  
  -- Content
  content        TEXT NOT NULL,           -- Human-readable description
  structured_data JSONB NOT NULL DEFAULT '{}',  -- Typed key-value data
  
  -- Search
  embedding      vector(1536),            -- OpenAI text-embedding-3-small
  search_vector  tsvector,               -- Full-text search
  
  -- Quality signals
  score          SMALLINT DEFAULT 50,     -- 0-100 importance score
  confidence     NUMERIC(3,2) DEFAULT 0.8, -- AI extraction confidence
  
  -- Status
  status         VARCHAR(30) DEFAULT 'active',
  -- Enum: pending_review | active | archived | rejected
  
  -- Access tracking (for relevance scoring)
  access_count   INTEGER DEFAULT 0,
  last_accessed  TIMESTAMPTZ,
  
  -- Source platform
  platform       VARCHAR(50),
  
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Critical indexes
CREATE INDEX idx_memories_user_id ON memories(user_id);
CREATE INDEX idx_memories_project_id ON memories(project_id);
CREATE INDEX idx_memories_type ON memories(user_id, type);
CREATE INDEX idx_memories_status ON memories(user_id, status);
CREATE INDEX idx_memories_score ON memories(user_id, score DESC);

-- Vector similarity index (HNSW for fast approximate search)
CREATE INDEX idx_memories_embedding 
  ON memories USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Full-text search index
CREATE INDEX idx_memories_search ON memories USING gin(search_vector);

-- Auto-update search_vector
CREATE OR REPLACE FUNCTION update_memory_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english', 
    COALESCE(NEW.content, '') || ' ' || 
    COALESCE(NEW.structured_data::text, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_memories_search
  BEFORE INSERT OR UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_memory_search_vector();
```

### 3.6 memory_suggestions

```sql
-- Temporary table for AI-extracted memories awaiting user approval
CREATE TABLE memory_suggestions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Extracted data (same shape as memories)
  type            VARCHAR(50) NOT NULL,
  content         TEXT NOT NULL,
  structured_data JSONB NOT NULL DEFAULT '{}',
  confidence      NUMERIC(3,2),
  suggested_score SMALLINT,
  
  -- Review state
  status          VARCHAR(30) DEFAULT 'pending',
  -- pending | approved | rejected
  
  -- If approved, links to created memory
  memory_id       UUID REFERENCES memories(id),
  
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_suggestions_user_pending 
  ON memory_suggestions(user_id, status) 
  WHERE status = 'pending';
```

### 3.7 tags

```sql
CREATE TABLE tags (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name    VARCHAR(100) NOT NULL,
  color   VARCHAR(7),
  
  UNIQUE(user_id, name)
);

-- Pivot table
CREATE TABLE memory_tags (
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id)
);

CREATE INDEX idx_memory_tags_memory ON memory_tags(memory_id);
CREATE INDEX idx_memory_tags_tag ON memory_tags(tag_id);
```

### 3.8 subscriptions

```sql
CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Stripe
  stripe_customer_id      VARCHAR(255) UNIQUE,
  stripe_subscription_id  VARCHAR(255) UNIQUE,
  stripe_price_id         VARCHAR(255),
  
  plan                VARCHAR(50) NOT NULL DEFAULT 'free',
  -- free | pro | teams
  
  status              VARCHAR(50) DEFAULT 'active',
  -- active | past_due | canceled | trialing
  
  trial_ends_at       TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
```

### 3.9 usage_logs

```sql
CREATE TABLE usage_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  action     VARCHAR(100) NOT NULL,
  -- memory_created | memory_extracted | search_semantic | injection_built | conversation_synced
  
  metadata   JSONB DEFAULT '{}',
  
  -- For billing period tracking
  period     VARCHAR(7),  -- YYYY-MM format
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitioned by month for performance
CREATE INDEX idx_usage_logs_user_period ON usage_logs(user_id, period);
CREATE INDEX idx_usage_logs_action ON usage_logs(user_id, action, period);
```

### 3.10 sync_queue (extension offline queue)

```sql
CREATE TABLE sync_queue (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  action      VARCHAR(50) NOT NULL,
  -- push_conversation | push_memory | delete_memory
  
  payload     JSONB NOT NULL,
  
  status      VARCHAR(30) DEFAULT 'pending',
  -- pending | processing | completed | failed
  
  attempts    SMALLINT DEFAULT 0,
  last_error  TEXT,
  
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_queue_pending 
  ON sync_queue(user_id, status, created_at)
  WHERE status = 'pending';
```

---

## 4. Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector"), uuidOssp(map: "uuid-ossp")]
}

model User {
  id          String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  clerkId     String   @unique @map("clerk_id")
  email       String   @unique
  displayName String?  @map("display_name")
  avatarUrl   String?  @map("avatar_url")
  timezone    String   @default("UTC")
  plan        String   @default("free")
  
  cloudSyncEnabled  Boolean @default(false) @map("cloud_sync_enabled")
  analyticsEnabled  Boolean @default(true) @map("analytics_enabled")
  
  memoryLimit    Int @default(100) @map("memory_limit")
  projectLimit   Int @default(3) @map("project_limit")
  extractionLimit Int @default(10) @map("extraction_limit")
  
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  lastActiveAt DateTime @default(now()) @map("last_active_at")
  
  // Relations
  projects       Project[]
  conversations  Conversation[]
  memories       Memory[]
  suggestions    MemorySuggestion[]
  tags           Tag[]
  subscriptions  Subscription[]
  usageLogs      UsageLog[]
  syncQueue      SyncQueue[]
  
  @@map("users")
}

model Project {
  id          String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  name        String
  description String?
  color       String   @default("#7C5CFC")
  icon        String   @default("📁")
  status      String   @default("active")
  keywords    String[]
  platforms   String[]
  
  memoryCount       Int @default(0) @map("memory_count")
  conversationCount Int @default(0) @map("conversation_count")
  
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  lastActiveAt DateTime @default(now()) @map("last_active_at")
  
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversations Conversation[]
  memories      Memory[]
  
  @@map("projects")
}

model Conversation {
  id        String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  projectId String?  @map("project_id") @db.Uuid
  
  platform   String
  sessionUrl String? @map("session_url")
  title      String?
  summary    String?
  
  messageCount     Int @default(0) @map("message_count")
  memoryExtracted  Int @default(0) @map("memory_extracted")
  
  syncedAt  DateTime? @map("synced_at")
  syncHash  String?   @map("sync_hash")
  
  startedAt DateTime  @map("started_at")
  endedAt   DateTime? @map("ended_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  project     Project?           @relation(fields: [projectId], references: [id], onDelete: SetNull)
  messages    Message[]
  suggestions MemorySuggestion[]
  memories    Memory[]
  
  @@map("conversations")
}

model Message {
  id             String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  conversationId String   @map("conversation_id") @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  
  role        String
  content     String
  contentHash String? @map("content_hash")
  tokenCount  Int?    @map("token_count")
  position    Int
  timestamp   DateTime
  createdAt   DateTime @default(now()) @map("created_at")
  
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("messages")
}

model Memory {
  id             String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  projectId      String?  @map("project_id") @db.Uuid
  conversationId String?  @map("conversation_id") @db.Uuid
  
  type           String
  content        String
  structuredData Json     @default("{}") @map("structured_data")
  
  // pgvector field - managed via raw SQL for now
  // embedding   Unsupported("vector(1536)")?
  
  score       Int     @default(50)
  confidence  Decimal @default(0.8)
  
  status      String  @default("active")
  platform    String?
  
  accessCount Int      @default(0) @map("access_count")
  lastAccessed DateTime? @map("last_accessed")
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  project      Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  conversation Conversation? @relation(fields: [conversationId], references: [id], onDelete: SetNull)
  memoryTags   MemoryTag[]
  
  @@map("memories")
}

model MemorySuggestion {
  id             String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  conversationId String   @map("conversation_id") @db.Uuid
  
  type           String
  content        String
  structuredData Json     @default("{}") @map("structured_data")
  confidence     Decimal?
  suggestedScore Int?     @map("suggested_score")
  
  status    String    @default("pending")
  memoryId  String?   @map("memory_id") @db.Uuid
  
  reviewedAt DateTime? @map("reviewed_at")
  createdAt  DateTime  @default(now()) @map("created_at")
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@map("memory_suggestions")
}

model Tag {
  id     String  @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId String  @map("user_id") @db.Uuid
  name   String
  color  String?
  
  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  memoryTags MemoryTag[]
  
  @@unique([userId, name])
  @@map("tags")
}

model MemoryTag {
  memoryId String @map("memory_id") @db.Uuid
  tagId    String @map("tag_id") @db.Uuid
  
  memory Memory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([memoryId, tagId])
  @@map("memory_tags")
}

model Subscription {
  id     String @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId String @map("user_id") @db.Uuid
  
  stripeCustomerId     String? @unique @map("stripe_customer_id")
  stripeSubscriptionId String? @unique @map("stripe_subscription_id")
  stripePriceId        String? @map("stripe_price_id")
  
  plan   String @default("free")
  status String @default("active")
  
  trialEndsAt         DateTime? @map("trial_ends_at")
  currentPeriodStart  DateTime? @map("current_period_start")
  currentPeriodEnd    DateTime? @map("current_period_end")
  canceledAt          DateTime? @map("canceled_at")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("subscriptions")
}

model UsageLog {
  id      String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId  String   @map("user_id") @db.Uuid
  action  String
  metadata Json    @default("{}")
  period  String?
  
  createdAt DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("usage_logs")
}

model SyncQueue {
  id      String @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId  String @map("user_id") @db.Uuid
  action  String
  payload Json
  status  String @default("pending")
  
  attempts  Int     @default(0)
  lastError String? @map("last_error")
  
  createdAt   DateTime  @default(now()) @map("created_at")
  processedAt DateTime? @map("processed_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sync_queue")
}
```

---

## 5. Auth Flow (Detailed)

```
1. User visits memoryos.ai
2. Clicks "Get Started" → Clerk modal opens
3. Signs up with email/Google/GitHub
4. Clerk sends webhook to: POST /auth/webhook
5. NestJS creates user record in DB (clerk_id, email)
6. Creates default subscription (plan: 'free')
7. Clerk redirects user to /onboarding
8. Every subsequent API request:
   - Sends: Authorization: Bearer <clerk_jwt>
   - NestJS ClerkGuard validates JWT
   - Extracts userId from JWT
   - Injects into request context
   - All queries scoped to that userId
9. Extension auth:
   - User clicks "Connect" in popup
   - Opens: memoryos.ai/auth?redirect=extension
   - User already signed in (Clerk session) → confirms
   - Server issues short-lived extension token
   - Token stored in chrome.storage.local
   - Used for all extension API calls
```

---

## 6. Row-Level Security (Supabase RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
-- (repeat for all tables)

-- Users can only see their own data
CREATE POLICY "Users own data" ON memories
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- (Same pattern for all tables)
```

> Note: Since we use Clerk (not Supabase Auth) as the primary auth, RLS is enforced at the NestJS service layer via explicit `WHERE user_id = :userId` on all queries. Supabase RLS acts as a secondary safety net.

---

## 7. Key Queries

### Semantic Memory Search
```typescript
// Raw query for vector search (Prisma doesn't natively support pgvector yet)
const results = await prisma.$queryRaw`
  SELECT 
    id, type, content, structured_data, score, project_id,
    1 - (embedding <=> ${queryEmbedding}::vector) AS similarity
  FROM memories
  WHERE 
    user_id = ${userId}::uuid
    AND status = 'active'
    AND (${projectId} IS NULL OR project_id = ${projectId}::uuid)
    AND 1 - (embedding <=> ${queryEmbedding}::vector) > 0.7
  ORDER BY similarity DESC
  LIMIT ${limit};
`;
```

### Build Injection Context
```typescript
// Top memories for injection (hybrid: score + recency + vector similarity)
const injectionMemories = await prisma.$queryRaw`
  SELECT 
    m.*,
    (
      (m.score * 0.4) +
      (EXTRACT(EPOCH FROM (NOW() - m.updated_at)) / -86400 * 10 + 100) * 0.2 +
      (1 - (m.embedding <=> ${queryEmbedding}::vector)) * 100 * 0.4
    ) AS relevance_score
  FROM memories m
  WHERE m.user_id = ${userId}::uuid
    AND m.status = 'active'
    AND m.project_id = ${projectId}::uuid
  ORDER BY relevance_score DESC
  LIMIT 15;
`;
```

### Pending Approvals Count
```typescript
const pendingCount = await prisma.memorySuggestion.count({
  where: { userId, status: 'pending' }
});
```

---

## 8. Data Retention & Cleanup

| Data | Retention | Cleanup Rule |
|------|-----------|-------------|
| Messages | 1 year (free), Forever (pro) | Cron job monthly |
| Rejected suggestions | 30 days | Auto-delete |
| Archived memories | 90 days | Auto-delete |
| Usage logs | 90 days | Partition drop |
| Sync queue (completed) | 7 days | Auto-delete |
| Deleted user data | 30 days | GDPR compliance window |
