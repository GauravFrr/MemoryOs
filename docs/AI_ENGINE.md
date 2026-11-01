# AI Engine: Extraction, Embeddings & Context Assembly

The MemoryOS AI Engine is responsible for transforming raw conversational dialogues into structured atomic knowledge, indexing it into a high-dimensional vector space, and dynamically packaging relevant context for prompt injection.

---

## 1. Multi-Tier AI Architecture

```
Conversation Turns (User / Assistant)
                 │
                 ▼
     ┌───────────────────────┐
     │  Structured Extraction│ ◄── Google Gemini (JSON schema mode)
     │  8 Memory Taxonomies  │
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Vector Embeddings     │ ◄── gemini-embedding-2 (768 Dimensions)
     │ 768-dim Vector Float  │
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Hybrid Search Index   │ ◄── pgvector HNSW (<=> Cosine Distance)
     │ & Score Weighting     │     + PostgreSQL GIN (tsvector Lexical)
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Context Assembly      │ ◄── Token budget constraint (max_tokens)
     │ Markdown Formatter    │     Prompt-ready injection block
     └───────────────────────┘
```

---

## 2. Extraction Pipeline & Memory Taxonomies

Memory extraction is executed asynchronously through BullMQ workers (`MemoryExtractionProcessor`). Conversations are analyzed against a strict JSON schema that categorizes knowledge into exactly **8 distinct memory types**:

| Memory Type | Scope & Purpose | Concrete Example |
|:---|:---|:---|
| **`personal`** | Factual attributes about the user | "User is an independent full-stack developer based in Berlin." |
| **`preference`** | Stylistic, architectural, or behavioral choices | "Prefers TypeScript strict mode, functional components, and TailwindCSS." |
| **`tool`** | Software, libraries, or SDKs actively utilized | "Uses Turborepo, pnpm workspaces, and NestJS 11 for microservices." |
| **`project`** | Details, architecture, or status of named projects | "MemoryOS: Monorepo containing Next.js 15 web app and Plasmo extension." |
| **`workflow`** | Step-by-step procedures or operational protocols | "Deployments to production require green GitHub Actions and a manual release tag." |
| **`decision`** | Explicit technical, architectural, or product decisions | "Switched from Pinecone to pgvector HNSW to unify storage and eliminate network hops." |
| **`template`** | Reusable snippets, templates, or prompt formats | "Standard Jest integration test harness with mock PrismaService." |
| **`entity`** | External organizations, collaborators, or services | "Supabase is used for managed PostgreSQL and pgvector hosting." |

### Extraction JSON Schema
```json
[
  {
    "type": "preference",
    "content": "User enforces explicit UUID casting in raw PostgreSQL queries.",
    "metadata": {
      "confidence": 0.96,
      "context": "SearchService refactor"
    }
  }
]
```

---

## 3. High-Availability LLM Client & Key Rotation

To ensure resilience and avoid rate limiting under heavy load, `AiService` implements:

1. **Multi-Key Pool & Round-Robin Rotation**:
   Reads `GEMINI_API_KEYS` from `.env` as comma-separated keys. If any key encounters `429 (Too Many Requests)` or quota depletion, requests automatically failover to subsequent keys with exponential backoff.
2. **Model Fallback Chain**:
   Attempts generation with top-tier reasoning models, cascading smoothly through lighter variants:
   `gemini-3.5-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-2.5-flash`
3. **Usage Logging**:
   Every token consumed is tracked in `usage_logs` to maintain transparency against daily plan allowances.

---

## 4. Vector Embeddings (768-Dimensional)

Vector generation uses Google's `gemini-embedding-2` model configured with fixed output dimensionality:

- **Dimensions**: `768` (matches `vector(768)` in PostgreSQL schema)
- **Metric**: Cosine Distance (`vector_cosine_ops`)
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent`

```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: { parts: [{ text: memoryContent }] },
    outputDimensionality: 768
  })
});
```

---

## 5. Semantic Search & Combined Scoring Formula

When querying for context (`SearchService`), results are ranked using a hybrid scoring algorithm that blends cosine similarity with historical user memory scores:

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

## 6. Prompt Injection Formatting

The context assembly engine in `InjectService` packages retrieved memories into an unobtrusive, standard Markdown block formatted for immediate LLM comprehension:

```markdown
[MemoryOS Context — Project Alpha]
• User enforces strict TypeScript interfaces across all shared packages.
• Database migrations must include HNSW index creation.

[MemoryOS — This Chat]
• 8 messages, Vector Search Tuning
• Reviewed cosine distance operators in pgvector.
```

The engine continuously calculates token consumption ($\approx 4\text{ chars/token}$) and truncates bullet entries before exceeding `max_tokens`.
