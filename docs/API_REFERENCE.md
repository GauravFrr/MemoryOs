# MemoryOS API Specification & Reference

The MemoryOS API is built using **NestJS 11** with TypeScript, strictly adhering to RESTful conventions, DTO class validation, and standard HTTP status codes.

- **Base URL (Local)**: `http://localhost:3001`
- **Swagger Documentation UI**: `http://localhost:3001/api`
- **Authentication**: Bearer JWT via Clerk (`Authorization: Bearer <token>`)

---

## 1. Authentication & Security

All private endpoints require a valid Clerk session JWT provided in the `Authorization` header:

```http
Authorization: Bearer <clerk_session_jwt>
```

The API validates this token via `ClerkGuard`. The token payload resolves to a database user in PostgreSQL. If the user does not exist yet (e.g. initial OAuth login), the Clerk webhook (`POST /auth/webhook`) synchronizes user records.

---

## 2. Endpoints Summary

| Category | Method | Path | Summary |
|:---|:---|:---|:---|
| **Auth** | `POST` | `/auth/webhook` | Process Svix-signed Clerk user lifecycle webhooks |
| | `GET` | `/auth/me` | Fetch authenticated user profile & quota stats |
| **Memories** | `GET` | `/memories` | List active memories with filtering |
| | `POST` | `/memories` | Manually create a structured memory |
| | `GET` | `/memories/suggestions` | Retrieve pending AI memory suggestions |
| | `POST` | `/memories/bulk-approve` | Bulk approve suggested memories |
| | `GET` | `/memories/:id` | Fetch memory details by ID |
| | `PATCH` | `/memories/:id` | Update memory content, score, or metadata |
| | `DELETE` | `/memories/:id` | Soft delete/remove memory and embedding |
| | `POST` | `/memories/:id/approve` | Approve a single suggested memory |
| | `POST` | `/memories/:id/reject` | Reject/archive a suggested memory |
| **Projects** | `GET` | `/projects` | List all projects belonging to user |
| | `POST` | `/projects` | Create a new project workspace |
| | `GET` | `/projects/:id` | Fetch project details and metadata |
| | `PATCH` | `/projects/:id` | Update project name, color, icon, or keywords |
| | `DELETE` | `/projects/:id` | Delete or archive project |
| **Conversations** | `POST` | `/conversations` | Ingest chat session & trigger background extraction |
| | `GET` | `/conversations` | List ingested conversations |
| | `GET` | `/conversations/:id` | Fetch conversation transcript |
| | `POST` | `/conversations/:id/extract` | Manually re-trigger AI extraction |
| | `GET` | `/conversations/by-url` | Query conversation summary by platform URL |
| | `GET` | `/conversations/:id/summary` | Generate a concise AI bullet summary |
| | `PATCH` | `/conversations/:id/project` | Assign or re-assign conversation to project |
| | `DELETE` | `/conversations/:id` | Delete conversation record |
| **Injection Engine**| `POST` | `/inject/build` | Build formatted context block for prompt injection |

---

## 3. Detailed Endpoint Specifications

### 3.1 Context Injection Engine

#### `POST /inject/build`
Constructs a prompt-ready context string based on project association, semantic topic matching, or conversation summary.

**Request Body (`BuildInjectionDto`):**
```json
{
  "platform": "claude",
  "project_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "topic": "Tailwind dark mode styling rules",
  "mode": "combined",
  "session_url": "https://claude.ai/chat/abc-123",
  "max_tokens": 1500
}
```

- `platform` *(required, string)*: Target platform (`claude`, `chatgpt`, `gemini`, `grok`).
- `project_id` *(optional, UUID)*: Scope context to a specific project.
- `topic` *(optional, string)*: If present, generates a 768-dim embedding and runs pgvector cosine similarity search. If omitted, falls back to top-scored and recent memories.
- `mode` *(optional, string)*: `'global'` | `'chat_summary'` | `'combined'` (defaults to `'global'`).
- `session_url` *(optional, string)*: Required if mode includes `'chat_summary'`.
- `max_tokens` *(optional, integer)*: Maximum token budget (default: 2000, max: 4000).

**Success Response (`200 OK`):**
```json
{
  "context_string": "[MemoryOS Context — Project Alpha]\n• Always use HSL color tokens for dark mode themes.\n• Prefer Radix primitives for dialogs and popovers.\n\n[MemoryOS — This Chat]\n• 14 messages, UI Architecture Discussion\n• Refactored button injection to use native toolbar container.\n• Avoided fixed sidebar push layouts.",
  "memories_used": 2,
  "token_estimate": 84
}
```

---

### 3.2 Memories Management

#### `GET /memories`
Fetches active memories for the authenticated user with optional project or tag filters.

**Query Parameters:**
- `projectId` *(optional, UUID)*
- `type` *(optional, enum)*: `personal` | `preference` | `tool` | `project` | `workflow` | `decision` | `template` | `entity`
- `status` *(optional, string)*: `active` | `pending_review` | `archived`

**Response (`200 OK`):**
```json
[
  {
    "id": "e8b0a944-8fa7-4f65-8ce6-a19e59174621",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "projectId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "type": "workflow",
    "content": "Deployments to staging run automatically on merge to main.",
    "structuredData": {
      "pipeline": "github-actions",
      "target": "staging"
    },
    "score": 85,
    "confidence": 0.94,
    "status": "active",
    "createdAt": "2026-06-25T12:00:00.000Z"
  }
]
```

#### `POST /memories`
Creates a memory entry manually.

**Request Body (`CreateMemoryDto`):**
```json
{
  "projectId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "type": "preference",
  "content": "Always format backend dates in ISO 8601 UTC string.",
  "structuredData": { "format": "ISO 8601" },
  "score": 90
}
```

#### `POST /memories/bulk-approve`
Approves multiple memory suggestions simultaneously.

**Request Body (`BulkApproveDto`):**
```json
{
  "memoryIds": [
    "e8b0a944-8fa7-4f65-8ce6-a19e59174621",
    "f1c0b933-7fa2-4e12-8de1-c19e59174689"
  ]
}
```

---

### 3.3 Conversations Ingestion

#### `POST /conversations`
Used by the browser extension to synchronize captured conversation transcripts. Automatically pushes a background extraction job to the `memory-extraction` BullMQ queue.

**Request Body (`CreateConversationDto`):**
```json
{
  "platform": "claude",
  "externalId": "chat-78901",
  "url": "https://claude.ai/chat/78901",
  "title": "Discussion on Vector Search Indexing",
  "projectId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "messages": [
    {
      "role": "user",
      "content": "Let's use HNSW indexes for cosine distance in PostgreSQL."
    },
    {
      "role": "assistant",
      "content": "Agreed. HNSW provides sub-millisecond approximate nearest neighbor lookup."
    }
  ]
}
```

**Response (`201 Created`):**
```json
{
  "id": "c3e8e244-6fa7-4e65-8ce6-b29e59174111",
  "platform": "claude",
  "title": "Discussion on Vector Search Indexing",
  "messageCount": 2,
  "createdAt": "2026-07-01T15:30:00.000Z"
}
```

---

### 3.4 Projects Management

#### `POST /projects`
Creates a workspace to organize memories, conversations, and keyword rules.

**Request Body (`CreateProjectDto`):**
```json
{
  "name": "E-Commerce App",
  "description": "Next.js store with Stripe checkout",
  "color": "#7C5CFC",
  "icon": "🛒",
  "keywords": ["store", "cart", "checkout", "stripe"],
  "platforms": ["claude", "chatgpt"]
}
```

---

## 4. Standard Error Structure

All errors returned by the API conform to NestJS standard exception formats:

```json
{
  "statusCode": 400,
  "message": [
    "max_tokens must not be greater than 4000",
    "platform must be a valid enum value"
  ],
  "error": "Bad Request"
}
```

| HTTP Status | Meaning |
|:---|:---|
| `400 Bad Request` | Failed class-validator constraints on DTO payload |
| `401 Unauthorized` | Missing or invalid Clerk JWT Bearer token |
| `403 Forbidden` | Access to resource not permitted for current user |
| `404 Not Found` | Requested entity ID does not exist |
| `429 Too Many Requests`| Plan memory limits or daily AI extraction quota exceeded |
| `500 Server Error` | Unhandled internal exception |
