# MemoryOS — Product Requirements Document (PRD)
**Version:** 1.0  
**Status:** Foundation Draft  
**Owner:** Gaurav (gauravstack)

---

## 1. Executive Summary

MemoryOS is a universal AI memory layer that sits between users and every AI model they use. It captures conversations, extracts structured memories (facts, preferences, decisions, workflows), builds a personal knowledge graph, and injects relevant context into any AI session — across ChatGPT, Claude, Gemini, Grok, and future models.

**Core Value Proposition:**
> "Your AI remembers every project, across every model."

The problem: Power users of AI tools — developers, founders, content creators, researchers — spend thousands of tokens every week re-explaining the same context. Their knowledge is fragmented across ChatGPT, Claude, and Gemini with no shared memory. MemoryOS solves this permanently.

---

## 2. Problem Statement

### 2.1 The Broken Status Quo

| Platform | Memory State |
|----------|-------------|
| ChatGPT | Limited, chat-isolated, no cross-project |
| Claude | Project-scoped, no external memory |
| Gemini | Separate ecosystem entirely |
| APIs | Users pay for context every single call |

### 2.2 Real User Pain

A typical power user with an "AI Story Channel" project:

- **Chat 1:** Defined workflow (Wan 2.2 → Shorts)
- **Chat 2:** Built character prompts
- **Chat 3:** Created thumbnail system
- **Chat 4:** Optimized Hindi storytelling script

After 30 days: Claude doesn't know Chat 1. ChatGPT doesn't know Chat 2. The user re-explains everything. Every day.

**Estimated waste:** 50,000–200,000 tokens/month per power user.

### 2.3 Why Current Solutions Fail

| Solution | Why It Fails |
|----------|-------------|
| ChatGPT Memory | Only works in ChatGPT, limited, unstructured |
| Claude Projects | Only works in Claude, manual, no cross-platform |
| Notion | Not AI-native, no auto-extraction, no injection |
| Obsidian | Manual, no AI capture, no injection |
| Browser Bookmarks | Just links, no intelligence |

---

## 3. Product Vision

**Mission:** Give users ownership of their AI memory — permanently, across every model.

**Vision:** Every AI model the user opens already knows who they are, what they're building, and how they work.

**Positioning:** MemoryOS is to AI models what an operating system is to applications — it's the memory layer that everything runs on top of.

```
User
 ↓
MemoryOS (Memory Layer)
 ├── ChatGPT
 ├── Claude
 ├── Gemini
 ├── Grok
 └── Future Models
```

---

## 4. Target Users

### 4.1 Primary Personas

**Persona 1: The AI Power User**
- Uses 2–3 AI models daily
- Has 10+ ongoing projects
- Repeats context 5–10x/day
- Willing to pay $10–15/month to stop

**Persona 2: The Developer / Freelancer**
- Uses AI for client projects
- Needs project-scoped context
- Builds workflows in AI assistants
- Wants memory isolated per client

**Persona 3: The Content Creator**
- Has complex creative workflows
- Uses AI for scripts, thumbnails, ideas
- Needs model-to-model consistency
- Values prompt templates

**Persona 4: The Researcher / Founder**
- Deep knowledge domains
- Citations, decisions, strategy docs
- Needs searchable AI history
- High token cost awareness

### 4.2 User Goals

| Goal | Frequency | Priority |
|------|-----------|----------|
| Never re-explain a project | Daily | Critical |
| Search across all AI chats | Weekly | High |
| Inject context into new session | Daily | Critical |
| Organize chats into projects | Weekly | High |
| Share/reuse prompt workflows | Monthly | Medium |

---

## 5. Product Modules

### 5.1 Module 1: Browser Extension (Core)

**Purpose:** Entry point. Lives in the browser. Captures and injects.

**Supported Platforms (Phase 1):**
- ChatGPT (chat.openai.com)
- Claude (claude.ai)
- Gemini (gemini.google.com)

**Supported Platforms (Phase 2):**
- Grok (grok.x.ai)
- Perplexity (perplexity.ai)

**Extension Features:**

| Feature | Description | Phase |
|---------|-------------|-------|
| Chat Capture | Auto-save conversations as user chats | 1 |
| Sidebar Panel | Floating panel showing relevant memories | 1 |
| Memory Suggestions | AI-extracted facts highlighted for approval | 1 |
| Context Injection | One-click inject project context into prompt | 1 |
| Project Detection | Auto-detect which project user is working on | 2 |
| Smart Injection | Auto-build context package before sending | 2 |
| Offline Support | Works without internet, syncs later | 3 |

### 5.2 Module 2: Web Dashboard

**Purpose:** Management hub. Where users organize, search, review everything.

**Pages:**

| Page | Purpose |
|------|---------|
| Home / Overview | Activity feed, recent memories, quick actions |
| Projects | All projects, create/edit/delete |
| Memory Vault | All extracted memories, searchable |
| Search | Full-text + semantic search across everything |
| Conversations | Raw chat archive, organized by project |
| Knowledge Graph | Visual brain map (Phase 5) |
| Settings | Profile, integrations, billing |
| Analytics | Memory usage, token savings, insights |

### 5.3 Module 3: Memory Engine

**Purpose:** The brain of the product. Transforms raw chats into structured knowledge.

**Memory Types:**

```json
{
  "personal":   { "name": "Gaurav", "timezone": "IST" },
  "preference": { "key": "scene_length", "value": "5 seconds" },
  "tool":       { "tool": "Wan 2.2", "use_case": "AI animation" },
  "project":    { "name": "AI Story Channel", "platform": "YouTube Shorts" },
  "workflow":   { "name": "Shorts Pipeline", "steps": ["Kaggle → Wan 2.2 → Edit → Upload"] },
  "decision":   { "decision": "Use Wan 2.2 over Flux", "reason": "Better Hindi style" },
  "template":   { "name": "Scene Prompt", "content": "..." },
  "entity":     { "name": "Dadaji", "type": "Character", "project": "AI Story Channel" }
}
```

**Extraction Process:**
1. Chat saved to local DB
2. AI extraction runs (Claude Haiku / GPT-4o Mini)
3. Candidate memories presented for approval
4. User approves/rejects/edits
5. Memory stored with score, tags, project link

### 5.4 Module 4: Search Engine

| Search Type | Description |
|-------------|-------------|
| Keyword | Full-text search across all content |
| Semantic | Vector similarity search (embeddings) |
| Hybrid | Keyword + semantic combined |
| Project-scoped | Search within a specific project |
| Graph | Relationship traversal (Phase 5) |

### 5.5 Module 5: Context Injection Engine

**Flow:**
```
User opens Claude → Extension detects topic
→ Memory engine queries relevant memories
→ Ranks by: recency, importance, project match
→ Builds context package
→ Shows: "18 memories found — Inject?"
→ User clicks → Context prepended to prompt
```

**Injection Format:**
```
[MemoryOS Context — AI Story Channel]
• Preferred scene length: 5 seconds
• Animation tool: Wan 2.2
• Language: Hindi (Hindustani storytelling style)
• Character: Dadaji (elderly narrator)
• Output platform: YouTube Shorts (60 sec max)
• Workflow: Kaggle GPU → Wan 2.2 → CapCut → Upload
```

### 5.6 Module 6: Knowledge Graph (Phase 5)

Visual graph showing:
- **Nodes:** User, Projects, Memories, Entities, Conversations
- **Edges:** Uses, Depends On, Related To, Created In
- **Traversal:** Click a project → see all memories, tools, decisions, characters

---

## 6. Feature Specifications

### 6.1 Chat Capture

**Trigger:** User sends a message in a supported AI platform  
**Action:** Extension captures full conversation turn  
**Storage:** Local IndexedDB first, cloud sync if enabled  
**Data captured:**
```json
{
  "session_id": "uuid",
  "platform": "claude",
  "project_id": "uuid or null",
  "messages": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ],
  "captured_at": "ISO timestamp",
  "url": "https://claude.ai/chat/..."
}
```

### 6.2 Memory Approval Flow

**UI Flow:**
1. After capture, AI runs extraction
2. Extension shows badge: "3 new memory suggestions"
3. User opens panel → sees candidates:
   - ✓ "Prefers 5-second scenes" [SAVE] [EDIT] [IGNORE]
   - ✓ "Uses Wan 2.2 for animation" [SAVE] [EDIT] [IGNORE]
   - ✓ "AI Story Channel targets Hindi audience" [SAVE] [EDIT] [IGNORE]
4. User approves → memories stored

### 6.3 Memory Scoring

Every memory gets an importance score (0–100):

| Signal | Score Boost |
|--------|-------------|
| Mentioned multiple times | +20 |
| Marked as decision | +15 |
| Part of active project | +15 |
| Tool/workflow preference | +10 |
| Recent (last 7 days) | +10 |
| User manually saved | +25 |
| User name/identity | +30 |

Low score memories (< 20) are archived after 30 days unless accessed.

### 6.4 Project System

**Project Object:**
```json
{
  "id": "uuid",
  "name": "AI Story Channel",
  "description": "...",
  "color": "#8B5CF6",
  "icon": "🎬",
  "tags": ["youtube", "AI", "hindi"],
  "platforms": ["claude", "chatgpt"],
  "memory_count": 47,
  "conversation_count": 183,
  "created_at": "...",
  "last_active": "..."
}
```

**Auto-detection:** Extension learns which URLs/topics map to which projects over time.

---

## 7. User Stories

### Core (Must-Have)

| ID | As a... | I want to... | So that... | Acceptance Criteria |
|----|---------|-------------|------------|---------------------|
| US-01 | Power user | Save my ChatGPT chats automatically | I don't lose my workflows | Chat saved within 5s of completion, visible in dashboard |
| US-02 | User | Search all my AI conversations | I can find anything fast | Results in <500ms, keyword + semantic |
| US-03 | User | Organize chats into projects | My work stays clean | Project creation, assignment, filter |
| US-04 | User | Get memory suggestions from my chats | I don't manually extract facts | AI suggests memories after each chat |
| US-05 | User | Approve/reject memory suggestions | I control what's saved | Approve/reject UI with edit option |
| US-06 | User | Inject project context into Claude | I stop repeating myself | One-click injection, formatted cleanly |
| US-07 | User | Search semantically | "Show my animation workflows" works | Vector search returns relevant results |
| US-08 | User | Use it offline | It works without internet | Local-first, syncs when online |

### Phase 2 (Should-Have)

| ID | Story | Notes |
|----|-------|-------|
| US-09 | Auto-detect project from conversation topic | ML-based detection |
| US-10 | Cross-platform memory (Claude memory shows in ChatGPT) | Universal memory |
| US-11 | Knowledge graph visualization | Phase 5 |
| US-12 | Share prompt templates with community | Marketplace |

---

## 8. Permission & Access Matrix

| Feature | Free | Pro | Teams |
|---------|------|-----|-------|
| Projects | 3 | Unlimited | Unlimited |
| Memories | 100 | Unlimited | Unlimited |
| Conversations stored | 50 | Unlimited | Unlimited |
| Storage | Local only | Local + Cloud | Local + Cloud |
| AI memory extraction | 10/month | Unlimited | Unlimited |
| Semantic search | ✗ | ✓ | ✓ |
| Context injection | Manual | Smart auto | Smart auto |
| Multi-device sync | ✗ | ✓ | ✓ |
| Team shared memory | ✗ | ✗ | ✓ |
| Team projects | ✗ | ✗ | ✓ |
| API access | ✗ | ✗ | ✓ |
| Analytics | Basic | Full | Full + Team |
| Priority support | ✗ | ✓ | ✓ |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Chat capture latency | < 100ms |
| Search response time | < 500ms |
| Memory extraction time | < 3s per chat |
| Extension load time | < 200ms |
| Offline availability | Full read, capture queued |
| Data encryption | AES-256 at rest, TLS 1.3 in transit |
| GDPR compliance | Full data export, right to delete |
| Extension size | < 2MB unpacked |
| Browser support | Chrome 90+, Edge 90+ |

---

## 10. Out of Scope (v1)

- Mobile app
- Desktop app
- Firefox extension (Phase 3)
- Real-time collaboration editing
- Video/audio capture
- AI model API key management
- Direct API integrations (only browser extension UI)

---

## 11. Success Metrics

| Metric | Phase 1 Target | Phase 2 Target |
|--------|---------------|---------------|
| Active users | 100 | 1,000 |
| Daily Active Users | 30% of signups | 40% of signups |
| Chats captured/user/day | 5 | 8 |
| Memories approved/user | 20 | 50 |
| Context injections/day | 2 | 5 |
| Paid conversion | 5% | 10% |
| Churn (monthly) | < 15% | < 8% |

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OpenAI/Claude DOM changes break extension | High | High | Robust DOM detection layer + version monitors |
| Privacy concerns block adoption | Medium | High | Local-first, zero telemetry free tier, clear privacy policy |
| Bad memory extraction quality | Medium | High | Human approval system, user edits |
| ChatGPT builds native cross-chat memory | Medium | Medium | Differentiate on cross-platform + ownership |
| Low retention | Medium | High | Hook is the memory graph — harder to leave over time |
