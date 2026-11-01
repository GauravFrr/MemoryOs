# Database Architecture & pgvector Schema

MemoryOS utilizes **PostgreSQL 16** managed via Supabase, with native vector search powered by the **pgvector** extension and object-relational mapping handled by **Prisma 6**.

---

## 1. PostgreSQL Extensions

The following extensions are initialized in database migrations:

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vector similarity search
CREATE EXTENSION IF NOT EXISTS "vector";
```

---

## 2. Entity Relationship Diagram (ERD)

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       ├───────────────┬────────────────┬──────────────┐
       ▼               ▼                ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────────┐
│   projects   │ │conversations │ │  memories   │ │ subscriptions │
└──────┬───────┘ └──────┬───────┘ └──────┬──────┘ └───────────────┘
       │                │                │
       │                ▼                ├──────────────┐
       │         ┌──────────────┐        ▼              ▼
       │         │   messages   │ ┌──────────────┐ ┌──────────────┐
       │         └──────────────┘ │  memory_tags │ │  usage_logs  │
       │                          └──────┬───────┘ └──────────────┘
       │                                 │
       │                                 ▼
       │                          ┌──────────────┐
       └─────────────────────────►│     tags     │
                                  └──────────────┘
```

---

## 3. Database Table Definitions

### 3.1 `users`
Represents the authenticated account, synchronized from Clerk.

| Column | Type | Constraints / Defaults | Description |
|:---|:---|:---|:---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT uuid_generate_v4()` | Unique internal identifier |
| `clerk_id` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Clerk identity subject ID |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | Verified primary email address |
| `display_name` | `VARCHAR(255)` | `NULLABLE` | Full name or nickname |
| `avatar_url` | `TEXT` | `NULLABLE` | Profile image URL |
| `timezone` | `VARCHAR(100)` | `DEFAULT 'UTC'` | User local timezone |
| `plan` | `VARCHAR(50)` | `DEFAULT 'free'` | `free`, `pro`, `teams` |
| `cloud_sync_enabled` | `BOOLEAN` | `DEFAULT false` | Cross-device cloud sync switch |
| `memory_limit` | `INTEGER` | `DEFAULT 100` | Max active memories allowed on plan |
| `project_limit` | `INTEGER` | `DEFAULT 3` | Max projects allowed on plan |
| `extraction_limit` | `INTEGER` | `DEFAULT 10` | Daily AI extraction call budget |

---

### 3.2 `projects`
Workspaces used to group context, conversations, and keyword rules.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `UUID` | Primary Key |
| `user_id` | `UUID` | Foreign Key → `users(id)` ON DELETE CASCADE |
| `name` | `VARCHAR(255)` | Project display name |
| `description` | `TEXT` | Optional workspace details |
| `color` | `VARCHAR(7)` | Hex color token (e.g. `#7C5CFC`) |
| `icon` | `VARCHAR(50)` | Emoji icon (e.g. `📁`, `🛒`) |
| `keywords` | `TEXT[]` | Keywords used by extension for auto-detection |
| `platforms` | `VARCHAR(50)[]`| Platforms associated with project |

---

### 3.3 `memories`
The atomic unit of knowledge in MemoryOS.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `UUID` | Primary Key |
| `user_id` | `UUID` | Foreign Key → `users(id)` ON DELETE CASCADE |
| `project_id` | `UUID` | Foreign Key → `projects(id)` ON DELETE SET NULL |
| `conversation_id`| `UUID` | Foreign Key → `conversations(id)` ON DELETE SET NULL |
| `type` | `VARCHAR(50)` | `personal`, `preference`, `tool`, `project`, `workflow`, `decision`, `template`, `entity` |
| `content` | `TEXT` | Extracted atomic memory text |
| `structured_data`| `JSONB` | Extracted entity parameters, key-values, and tool options |
| `score` | `INTEGER` | Importance score (0–100) |
| `confidence` | `FLOAT` | AI extraction confidence score (0.0–1.0) |
| `status` | `VARCHAR(50)` | `active`, `pending_review`, `archived`, `rejected` |
| `embedding` | `vector(768)` | 768-dimensional embedding from Gemini |
| `search_vector` | `tsvector` | Full-text search tokens |

---

### 3.4 `conversations` & `messages`
Ingested chat sessions from ChatGPT, Claude, and Gemini.

- `conversations`: Stores session metadata (`platform`, `external_id`, `url`, `title`, `summary`, `message_count`).
- `messages`: Stores individual turns (`role`: `user` | `assistant`, `content`, `tokens`, `sequence`).

---

### 3.5 `usage_logs`
Tracks API consumption and daily Gemini quota against the 1,500 req/day free tier ceiling.

| Column | Type | Description |
|:---|:---|:---|
| `id` | `UUID` | Primary Key |
| `user_id` | `UUID` | Foreign Key → `users(id)` |
| `action` | `VARCHAR(100)` | `injection_built`, `extraction_completed`, `embedding_generated` |
| `tokens_used` | `INTEGER` | Estimated token volume |
| `model` | `VARCHAR(100)` | Model invoked (`gemini-2.0-flash`, `gemini-embedding-2`) |
| `metadata` | `JSONB` | Request parameters, platform, and latency |

---

## 4. Indexing & Vector Search Optimization

### 4.1 HNSW Cosine Similarity Index
An HNSW (Hierarchical Navigable Small World) index is created directly on the 768-dimensional vector column for sub-millisecond approximate nearest neighbor (ANN) retrieval:

```sql
CREATE INDEX idx_memories_embedding_hnsw 
ON memories 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### 4.2 GIN Full-Text Index & Auto-Update Trigger
To enable hybrid lexical search alongside vector search, a GIN index and automatic trigger maintain the `tsvector` column:

```sql
-- GIN Index
CREATE INDEX idx_memories_search_vector 
ON memories 
USING gin (search_vector);

-- Trigger Function
CREATE OR REPLACE FUNCTION update_memories_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger Definition
CREATE TRIGGER trig_update_memories_search_vector
BEFORE INSERT OR UPDATE OF content ON memories
FOR EACH ROW
EXECUTE FUNCTION update_memories_search_vector();
```

---

## 5. Prisma Workflow & Maintenance

1. **Regenerate Client**: Run after modifying `prisma/schema.prisma`:
   ```bash
   pnpm db:generate
   ```
2. **Apply Migrations**:
   ```bash
   pnpm db:migrate
   ```
3. **Inspect Database UI**:
   ```bash
   pnpm db:studio
   ```
4. **Seed Sample Data**:
   ```bash
   pnpm db:seed
   ```
