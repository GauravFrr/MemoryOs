# MemoryOS — App Flow Document
**Version:** 1.0

---

## 1. Global Navigation Structure

```
MemoryOS
├── Landing Page (memoryos.ai)
│   ├── → Sign Up (Clerk)
│   └── → Sign In (Clerk)
│
├── Onboarding Flow (new users only)
│   ├── Step 1: Install Extension
│   ├── Step 2: Choose First AI Platform
│   ├── Step 3: Create First Project
│   └── Step 4: Tutorial Chat Capture
│
└── Dashboard App (app.memoryos.ai)
    ├── /home              ← Home / Overview
    ├── /projects          ← Projects List
    │   └── /projects/:id  ← Single Project View
    ├── /memories          ← Memory Vault
    │   └── /memories/:id  ← Single Memory
    ├── /conversations     ← Chat Archive
    │   └── /conversations/:id ← Single Conversation
    ├── /search            ← Universal Search
    ├── /graph             ← Knowledge Graph (Phase 5)
    ├── /settings          ← Settings
    │   ├── /settings/profile
    │   ├── /settings/integrations
    │   ├── /settings/billing
    │   └── /settings/privacy
    └── /analytics         ← Usage Analytics
```

---

## 2. Landing Page Flow

```
[Landing Page]
│
├── Hero Section
│   ├── Headline: "Your AI Remembers Everything"
│   ├── Subhead: "One brain for ChatGPT, Claude, Gemini, and every AI you use."
│   ├── [Get Started Free] → /signup
│   └── [Watch Demo] → Opens video modal
│
├── How It Works Section
│   ├── Step 1: Install Extension
│   ├── Step 2: Chat as normal
│   └── Step 3: AI remembers forever
│
├── Features Section
│   ├── Universal Memory
│   ├── Smart Extraction
│   ├── One-Click Injection
│   └── Knowledge Graph
│
├── Pricing Section
│   ├── Free Card → [Start Free]
│   ├── Pro Card → [Start Pro - $12/mo]
│   └── Teams Card → [Contact Us]
│
└── Footer
    ├── Privacy Policy
    ├── Terms
    └── Blog
```

---

## 3. Auth Flow

### 3.1 Sign Up
```
[/signup]
│
├── Clerk UI: Email / Google / GitHub
│   ↓
├── Email verification (if email signup)
│   ↓
├── Clerk webhook fires → DB user created
│   ↓
└── Redirect → /onboarding/step-1
```

### 3.2 Sign In
```
[/signin]
│
├── Clerk UI: credentials
│   ↓
├── JWT issued
│   ↓
└── Redirect → /home (or last visited page)
```

### 3.3 Extension Auth
```
User opens extension popup
│
├── Not signed in?
│   └── [Connect Account] → Opens memoryos.ai/auth-extension?token=...
│                           → User signs in on web
│                           → Token passed back to extension
│                           → Extension stores in chrome.storage.local
│
└── Signed in?
    └── Show current user + sync status
```

---

## 4. Onboarding Flow

### Step 1: Install Extension
```
[/onboarding/step-1]
│
├── Heading: "Install the MemoryOS Extension"
├── [Add to Chrome] button → Opens Chrome Web Store
├── Progress indicator: Step 1 of 4
├── Extension installed? (detected via ping)
│   ├── YES → Auto-advance to Step 2
│   └── NO → Wait + [I'll do it later] → /home (limited)
```

### Step 2: Choose Platform
```
[/onboarding/step-2]
│
├── Heading: "Which AI do you use most?"
├── Platform cards (multi-select):
│   ├── [ChatGPT] ✓
│   ├── [Claude] ✓
│   ├── [Gemini]
│   └── [Grok]
├── [Continue] → Step 3
```

### Step 3: Create First Project
```
[/onboarding/step-3]
│
├── Heading: "Create your first project"
├── Project name input
├── Color picker (6 colors)
├── Icon picker (emoji)
├── Description (optional)
├── [Create Project] → Step 4
└── [Skip] → /home
```

### Step 4: Tutorial
```
[/onboarding/step-4]
│
├── Heading: "Now let's capture your first memory"
├── Animated GIF showing:
│   1. Open Claude/ChatGPT
│   2. Chat normally
│   3. Extension badge appears
│   4. Memory suggested
│   5. Approve it
├── [Open Claude to try] → Opens claude.ai in new tab
└── [Go to Dashboard] → /home
```

---

## 5. Dashboard — Home

```
[/home]
│
├── Top Bar
│   ├── MemoryOS logo
│   ├── Search bar (→ /search on focus)
│   ├── [+ New Project] button
│   ├── Notification bell (pending approvals badge)
│   └── User avatar → dropdown (profile, billing, logout)
│
├── Left Sidebar (persistent)
│   ├── 🏠 Home
│   ├── 📁 Projects (with count)
│   ├── 🧠 Memory Vault
│   ├── 💬 Conversations
│   ├── 🔍 Search
│   ├── 📊 Analytics
│   ├── 🕸️ Graph (Phase 5, locked badge)
│   ├── ─────────────
│   └── ⚙️ Settings
│
├── Main Content
│   ├── [Greeting: "Good morning, Gaurav"]
│   │
│   ├── Stats Row (4 cards)
│   │   ├── Total Memories: 47
│   │   ├── Chats Captured: 183
│   │   ├── Projects: 4
│   │   └── Tokens Saved: ~12,000
│   │
│   ├── Pending Approvals section (if any)
│   │   ├── "3 memories waiting for approval"
│   │   └── [Review Now] → opens approval modal
│   │
│   ├── Recent Projects (horizontal scroll)
│   │   └── [Project Card] × N → /projects/:id
│   │
│   └── Recent Conversations (list)
│       ├── [Chat title] [Platform icon] [Time]
│       └── → /conversations/:id on click
```

---

## 6. Projects Flow

### 6.1 Projects List (/projects)
```
[/projects]
│
├── Header: "Projects" + [+ New Project] button
├── Filter tabs: All | Active | Archived
├── Sort: Last active | Name | Memory count
│
├── Project Grid (card per project)
│   ├── Project icon + color
│   ├── Name
│   ├── Memory count
│   ├── Conversation count
│   ├── Last active
│   ├── Platform tags (ChatGPT, Claude)
│   └── [⋮ Menu] → Edit | Archive | Delete
│
└── Click project card → /projects/:id
```

### 6.2 Create Project Modal
```
[+ New Project] clicked
│
├── Slide-over modal appears from right
├── Fields:
│   ├── Name (required)
│   ├── Description (optional)
│   ├── Color (6 swatches)
│   ├── Icon (emoji picker)
│   └── Tags (multi-input)
│
├── [Create Project] → creates → closes modal → shows card
└── [Cancel] → closes modal
```

### 6.3 Single Project View (/projects/:id)
```
[/projects/:id]
│
├── Project Header
│   ├── Icon + Name + Color bar
│   ├── Description
│   ├── Stats: X memories, Y conversations
│   └── [Edit] [Archive] [Delete]
│
├── Tab Bar: Memories | Conversations | Graph | Settings
│
├── Memories Tab (default)
│   ├── Memory type filter (All | Facts | Workflows | Decisions...)
│   ├── Memory cards (list)
│   │   ├── Type badge
│   │   ├── Content
│   │   ├── Score bar
│   │   ├── Tags
│   │   └── [Edit] [Delete]
│   └── [+ Add Memory] → create memory modal
│
├── Conversations Tab
│   └── List of conversations assigned to this project
│
├── Graph Tab (Phase 5)
│   └── React Flow graph of project knowledge
│
└── Settings Tab
    ├── Rename project
    ├── Change color/icon
    ├── Auto-detect keywords (for extension)
    └── Delete project
```

---

## 7. Memory Vault Flow (/memories)

```
[/memories]
│
├── Header: "Memory Vault" + search bar
│
├── Filter Panel (left)
│   ├── Type: All | Facts | Preferences | Tools | Workflows | Decisions | Templates
│   ├── Project: All | [project list]
│   ├── Score: All | High (70+) | Medium | Low
│   ├── Platform: All | ChatGPT | Claude | Gemini
│   └── Date: All | Last 7d | Last 30d | Custom
│
├── Memory List (main)
│   ├── Sort: Score | Recency | Type
│   ├── Memory Card:
│   │   ├── [Type Badge] e.g. "🔧 Tool"
│   │   ├── Content: "Uses Wan 2.2 for AI animation"
│   │   ├── Structured data pill: { tool: "Wan 2.2" }
│   │   ├── Score: ████░░ 72
│   │   ├── Project tag
│   │   ├── Tags
│   │   └── Actions: [Edit] [Delete] [Boost Score]
│   └── Pagination / infinite scroll
│
└── Pending Approvals banner (if any)
    └── [Review 3 suggestions] → opens Approval Modal
```

### 7.1 Approval Modal
```
[Approval Modal]
│
├── "Review Memory Suggestions" heading
├── Counter: "3 of 8"
│
├── Memory card:
│   ├── Source: "From Claude chat — AI Story Channel"
│   ├── Extracted: "Prefers 5-second scene length"
│   ├── Type: preference
│   ├── Structured: { scene_length: "5 seconds" }
│   ├── [Edit content] inline edit
│   ├── [✓ Save] → saves + shows next
│   ├── [✗ Ignore] → discards + shows next
│   └── [← Back]
│
└── After all reviewed → "Done! 5 memories saved." → closes
```

---

## 8. Conversations Flow (/conversations)

```
[/conversations]
│
├── Header + search
├── Filter: All platforms | ChatGPT | Claude | Gemini
├── Filter: All projects | unassigned | [project list]
│
├── Conversation List
│   ├── Platform icon
│   ├── Title (auto-generated or first user message)
│   ├── Preview text
│   ├── Date + time
│   ├── Project tag
│   ├── Memory count extracted
│   └── [Assign to project] [Delete]
│
└── Click conversation → /conversations/:id
```

### 8.1 Single Conversation (/conversations/:id)
```
[/conversations/:id]
│
├── Header
│   ├── Platform icon + date
│   ├── Project dropdown (assign/reassign)
│   └── [Run Extraction] [Delete]
│
├── Two-panel layout
│   ├── LEFT: Conversation transcript
│   │   ├── User message bubbles
│   │   └── AI message bubbles
│   │
│   └── RIGHT: Extracted Memories panel
│       ├── Approved memories (green)
│       ├── Pending memories (yellow)
│       ├── Rejected memories (red, collapsed)
│       └── [Extract Now] if none yet
│
└── Bottom: AI Summary section
    ├── Auto-generated summary card
    ├── Key decisions bullet list
    └── [Regenerate Summary]
```

---

## 9. Search Flow (/search)

```
[/search]
│
├── Large search bar (focused on load)
├── Recent searches (below bar, empty state)
│
├── After typing:
│   ├── Search type toggle: 🔤 Keyword | 🧠 Semantic | 🔀 Hybrid
│   ├── Scope: All | Memories | Conversations | Projects
│   └── Project filter
│
├── Results
│   ├── Memory results (with type badge, score, project)
│   ├── Conversation results (with excerpt, date, platform)
│   └── "No results" state with suggestions
│
└── Click result:
    ├── Memory → /memories/:id
    └── Conversation → /conversations/:id
```

---

## 10. Extension UI Flow

### 10.1 Extension Popup
```
[Extension Icon Clicked]
│
├── Not signed in:
│   └── [Connect Account] button
│
├── Signed in:
│   ├── User avatar + name
│   ├── Sync status: "Synced 2 min ago" ✓
│   ├── Stats: Memories: 47 | Projects: 4
│   ├── Active project selector dropdown
│   └── [Open Dashboard] link
```

### 10.2 Extension Sidebar (on AI Platform pages)
```
[Sidebar — collapsed by default, opens on click]
│
├── HEADER
│   ├── MemoryOS logo
│   ├── Active project: [AI Story Channel ▼]
│   └── [✕] close button
│
├── INJECT TAB (default)
│   ├── "Relevant memories found: 8"
│   ├── Memory pills (preview):
│   │   ├── ✓ "5-second scene length"
│   │   ├── ✓ "Wan 2.2 workflow"
│   │   └── ✓ "Hindi storytelling style"
│   ├── [Select All] [Deselect]
│   ├── Token estimate: "~350 tokens"
│   └── [Inject into prompt ↑] → prepends to text area
│
├── CAPTURE TAB
│   ├── "Current chat: not saved"
│   ├── [Save This Chat] button
│   ├── Assign project dropdown
│   └── "Memories extracted: 3" (after save)
│
├── MEMORIES TAB
│   ├── Quick search within project
│   └── Memory list (compact)
│       ├── Memory card (type + content)
│       └── [Copy] button on each
│
└── FOOTER
    ├── Sync status
    └── [Open Dashboard]
```

### 10.3 Memory Suggestion Notification
```
[After AI responds]
│
Extension badge shows: "💡 3"
│
User clicks badge or sidebar opens automatically:
│
├── "New memory suggestions from this chat"
├── [Suggestion 1]: "You prefer 5-second scenes" [✓ Save] [✗ Skip]
├── [Suggestion 2]: "Wan 2.2 for animation" [✓ Save] [✗ Skip]
└── [Suggestion 3]: "AI Story Channel target: Hindi audience" [✓ Save] [✗ Skip]
```

---

## 11. Settings Flow (/settings)

### 11.1 Profile
```
[/settings/profile]
│
├── Avatar upload
├── Display name
├── Email (read-only, from Clerk)
├── Timezone
└── [Save Changes]
```

### 11.2 Integrations
```
[/settings/integrations]
│
├── Browser Extension section
│   ├── Status: Connected ✓ / Not installed
│   ├── Last sync: "2 minutes ago"
│   └── [Resync Now]
│
├── AI Platforms section
│   ├── ChatGPT: Active ✓
│   ├── Claude: Active ✓
│   ├── Gemini: Not detected
│   └── Grok: Coming soon
│
└── API section (Pro+)
    ├── API Key: [Generate Key]
    └── Docs link
```

### 11.3 Billing
```
[/settings/billing]
│
├── Current plan: Free / Pro / Teams
├── Usage:
│   ├── Memories: 47 / 100 ████░
│   ├── Projects: 3 / 3 ██████
│   └── Extraction: 8 / 10 █████
│
├── [Upgrade to Pro - $12/mo]
│   └── → Stripe Checkout
│
└── If Pro:
    ├── Next billing: Jan 15, 2026
    ├── [Manage Billing] → Stripe Portal
    └── [Cancel Plan]
```

### 11.4 Privacy
```
[/settings/privacy]
│
├── Data storage: Local-first ✓ / Cloud sync toggle
├── Analytics: On/Off toggle
├── [Export All Data] → Download ZIP
├── [Delete All Data] → confirmation modal
└── [Delete Account] → double confirmation → Clerk delete
```

---

## 12. State Machine Summary

### Extension Capture State
```
IDLE
  ↓ user sends message
CAPTURING
  ↓ response received
EXTRACTING (background)
  ↓ extraction complete
SUGGESTIONS_PENDING
  ↓ user reviews
APPROVED / REJECTED
  ↓ sync runs
SYNCED → IDLE
```

### Memory Approval State
```
SUGGESTED → PENDING_REVIEW → APPROVED → ACTIVE
                          ↘ REJECTED → ARCHIVED
```

### Sync State
```
OFFLINE → queued locally
ONLINE  → push queue → SYNCED
        → pull latest → MERGED
```
