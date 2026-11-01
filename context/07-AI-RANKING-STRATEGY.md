# MemoryOS — AI Search Ranking Strategy (GEO)
## How to Rank Inside ChatGPT, Claude, Gemini & Perplexity
**Version:** 1.0

---

## 1. What is GEO?

**GEO = Generative Engine Optimization**

Traditional SEO gets you on Google Page 1.  
GEO gets you *inside the AI's answer* when someone asks:

> "What's the best tool to save my ChatGPT chats?"  
> "How do I remember context across AI models?"  
> "Best AI memory manager extension?"

When an AI model answers these questions, it draws from:
1. Training data (web crawls, CommonCrawl, GitHub, Reddit, docs)
2. Real-time web search (Perplexity, ChatGPT with browsing, Claude with search)
3. Cited sources it has seen cited frequently

MemoryOS must become a **deeply embedded source** in all three layers.

---

## 2. How AI Models Discover Products

### 2.1 The Ranking Signals

| Signal | Weight | Why It Matters |
|--------|--------|----------------|
| Backlinks from high-DA sites | High | AI crawlers trust PageRank |
| Reddit mentions (r/ChatGPT, r/ClaudeAI) | Very High | Reddit is heavily in training data |
| GitHub presence | High | Crawled constantly by all AI companies |
| Product Hunt listing | Medium | Cited frequently in AI roundups |
| HackerNews mentions | High | In training data of every major LLM |
| Documentation site | High | AI loves well-structured /docs |
| YouTube tutorials with transcripts | Medium | Transcripts crawled |
| Twitter/X threads | Medium | In some training sets |
| Directory listings (Futurepedia, etc.) | Medium | Aggregator sites AI cites |
| Direct user mentions ("I use MemoryOS") | Very High | User behavior → model weighting |

### 2.2 The Core Strategy

```
Phase 1: Build the content corpus
  → Articles, docs, GitHub, directories
  → Goal: AI models encounter MemoryOS from 50+ unique sources

Phase 2: Earn citations from authority sites
  → Guest posts, PR, Reddit organic posts
  → Goal: High-DA sites link to + mention MemoryOS

Phase 3: Automate production
  → n8n pipeline generates weekly content
  → Goal: Constant fresh signal at scale
```

---

## 3. Content Architecture (The Corpus)

### 3.1 Programmatic SEO Pages

Build 200+ SEO pages automatically. Each targets a specific search query + AI prompt pattern.

**Page Templates:**

```
/memory-for-chatgpt
/memory-for-claude
/memory-for-gemini
/chatgpt-memory-manager
/claude-context-management
/ai-memory-across-models
/best-ai-memory-tool-2025
/how-to-save-chatgpt-conversations
/universal-ai-memory-layer
/cross-platform-ai-memory
/chatgpt-forgets-context-fix
/claude-project-memory-alternative
/ai-second-brain
/prompt-memory-manager
```

**Category Hubs:**
```
/tools/ai-memory/
/tools/chatgpt-extensions/
/tools/claude-tools/
/compare/memoryos-vs-chatgpt-memory/
/compare/memoryos-vs-notion/
/use-cases/developers/
/use-cases/content-creators/
/use-cases/researchers/
```

**Tech:** Next.js with static generation. Each page has:
- Target keyword in H1, URL, meta title
- 600–1200 words of original content
- Schema markup (SoftwareApplication)
- Internal links to related pages
- FAQ section (targets "People Also Ask")

### 3.2 Blog Content Strategy

**Cadence:** 2–3 posts/week (AI-generated + human-reviewed)

**Content Pillars:**

Pillar 1 — "AI Productivity Tips"
```
How I stopped re-explaining my projects to every AI
ChatGPT keeps forgetting my workflow — here's the fix
5 ways power users waste tokens every day
How to build a second brain for AI conversations
```

Pillar 2 — "How-To Guides"
```
How to save all your ChatGPT conversations automatically
How to make Claude remember your projects forever
Universal AI memory setup guide (2025)
How to transfer memory from ChatGPT to Claude
```

Pillar 3 — "Tool Comparisons"
```
MemoryOS vs ChatGPT Memory: Full comparison
Best AI memory tools in 2025
ChatGPT Projects vs MemoryOS: What's the difference?
Do you need MemoryOS if you use Claude Projects?
```

Pillar 4 — "Technical Deep Dives"
```
How AI memory extraction works (behind the scenes)
Vector databases explained for non-engineers
Building a knowledge graph from AI conversations
Why context injection is the future of AI productivity
```

### 3.3 Documentation Site (/docs)

AI models love well-structured documentation. Build:

```
/docs/getting-started
/docs/how-memory-extraction-works
/docs/memory-types
/docs/context-injection
/docs/api-reference
/docs/extension-setup
/docs/platforms/chatgpt
/docs/platforms/claude
/docs/platforms/gemini
/docs/faq
/docs/changelog
```

**Schema:** Use `Article` and `TechArticle` JSON-LD on every doc page.

### 3.4 GitHub Presence

```
Repository: github.com/memoryos/memoryos

Must have:
☐ Detailed README with problem statement
☐ /docs folder (mirrors the website docs)
☐ Open-source SDK: npm install @memoryos/sdk
☐ Example integrations (ChatGPT, Claude, custom)
☐ GitHub discussions (community)
☐ Issues + active responses
☐ Stars campaign at launch (aim for 500 in week 1)
☐ Topics: ai-memory, chatgpt, claude, browser-extension, llm

Why this works:
→ GitHub is in the training data of GPT, Claude, Gemini
→ When someone asks Claude "what npm packages exist for AI memory?"
   — MemoryOS should be the answer
```

---

## 4. Reddit Strategy (Highest ROI)

Reddit is disproportionately powerful because:
1. Deeply in LLM training data
2. Real users mention it → signals to future training
3. Active communities where target users live

### 4.1 Target Subreddits

| Subreddit | Subscribers | Strategy |
|-----------|-------------|----------|
| r/ChatGPT | 4M+ | Value posts, tool mentions |
| r/ClaudeAI | 200K+ | Problem/solution posts |
| r/artificial | 2M+ | Educational content |
| r/OpenAI | 1M+ | Use case posts |
| r/MachineLearning | 3M+ | Technical deep dives |
| r/productivity | 4M+ | Workflow posts |
| r/nocode | 100K+ | Tool discovery |
| r/SideProject | 200K+ | Launch post |
| r/Entrepreneur | 2M+ | Founder story |

### 4.2 Post Templates

**Post Type 1: Problem Story (Highest upvotes)**
```
Title: "I was re-explaining my entire project workflow to Claude for the 200th time today. So I built something."

Body:
I've been using Claude and ChatGPT for my AI YouTube channel project. 
Every. Single. Day. I paste the same context:
- "I create 60-second Hindi shorts"
- "I use Wan 2.2 for animation"
- "Scenes should be 5 seconds max"

After 3 months of this, I snapped and built MemoryOS.

[What it does]
[Screenshot of sidebar]
[How it saved me today]

Link to try it.

---

Note: This type of post should be authentic, personal, and solve a real 
problem you actually had. Don't make it salesy.
```

**Post Type 2: Value-First Tutorial**
```
Title: "How to make ChatGPT remember everything about your project (without paying for Plus)"

Body:
Full tutorial on building a personal context system.
Mentions MemoryOS at the end as a tool that automates this.
```

**Post Type 3: Question Seeding**
```
Create secondary account → ask question:
"Is there a tool that lets you share memory between ChatGPT and Claude?"

Primary account (later) or organic users answer mentioning MemoryOS.
```

### 4.3 Reddit Automation Rules

- **Never spam.** One promotional post per subreddit per month max.
- Build karma on subreddit before posting (comment valuably for 2–3 weeks)
- 80/20 rule: 80% pure value content, 20% MemoryOS mentions
- Always disclose affiliation in promotional posts

---

## 5. Directory Listings (Automated Submissions)

Submit to these on launch day:

```
Tier 1 (High DA, AI-specific):
☐ Product Hunt
☐ Futurepedia
☐ There's An AI For That
☐ AI Top Tools
☐ Toolify.ai
☐ AI Finder
☐ Future Tools

Tier 2 (General):
☐ AlternativeTo
☐ G2 (create profile)
☐ Capterra
☐ Slant
☐ SaaSHub
☐ BetaList
☐ Indie Hackers (launch post)
☐ Launching Next

Tier 3 (Niche):
☐ Chrome Web Store (description optimized)
☐ HackerNews (Show HN post)
☐ Dev.to article
☐ Hashnode article
```

**For each listing, include:**
- Problem statement (exact wording of user pain)
- "Works with ChatGPT, Claude, Gemini" in description
- Screenshots
- Link to /docs

---

## 6. YouTube Strategy

YouTube transcripts are in AI training data. Videos = content that ranks.

**Channel: MemoryOS**

**Video Series:**

Series 1: "The AI Memory Problem"
```
Ep 1: Why ChatGPT keeps forgetting you (and how to fix it)
Ep 2: I tested every AI memory tool. Here's what works.
Ep 3: The real reason power users waste 50,000 tokens/month
```

Series 2: Tutorials
```
"How to never explain your project to AI again"
"MemoryOS full setup guide (10 minutes)"
"From zero to AI second brain in one afternoon"
"How to make Claude remember like a human assistant"
```

Series 3: Use Cases
```
"How I use MemoryOS for my YouTube Shorts channel"
"Developer workflow: AI memory for client projects"
"Researcher setup: Making AI remember everything"
```

**Optimization:**
- Title: Exact search phrase people type
- Description: Full text transcript (800+ words)
- Tags: chatgpt memory, claude memory, ai extension, etc.
- Chapters: Helps AI models parse the content

---

## 7. Automated Content Pipeline (n8n)

### 7.1 Architecture

```
[Weekly Trigger — every Monday 9 AM]
         ↓
[n8n Workflow: ContentEngine]
         ↓
    ┌────┴────────────────────────────────┐
    │                                     │
    ▼                                     ▼
[Blog Post Generator]          [SEO Page Generator]
    │                                     │
    ├─ Input: topic from queue            ├─ Input: keyword list
    ├─ Claude API: write draft            ├─ Claude API: write page
    ├─ Human review (Notion)             ├─ Auto-publish to /app
    └─ Publish to blog                   └─ Submit sitemap to GSC
         ↓
[Social Amplifier]
    ├─ Extract key insight from post
    ├─ Generate Twitter/X thread (Claude)
    ├─ Generate LinkedIn post (Claude)
    ├─ Generate Reddit draft (human approves)
    └─ Schedule via Buffer/Typefully
         ↓
[Analytics Reporter]
    ├─ Check keyword rankings (Ahrefs API)
    ├─ Check Reddit post performance
    ├─ Check YouTube views
    └─ Email weekly report
```

### 7.2 n8n Workflow: Blog Post Generator

```json
Nodes:
1. Schedule Trigger (weekly)
2. HTTP Request → GET /api/content-queue (pulls next topic)
3. Claude API → Write 1200-word blog post
   System: "You are a content writer for MemoryOS, an AI memory tool..."
   Prompt: "Write a detailed, helpful blog post about: {{topic}}"
4. HTTP Request → POST to CMS (or write to GitHub repo)
5. HTTP Request → Google Search Console ping new URL
6. Send Slack notification "New post published: {{title}}"
```

### 7.3 n8n Workflow: Social Distributor

```json
Nodes:
1. Webhook Trigger (fires when new blog post published)
2. HTTP Request → Fetch blog post content
3. Claude API → "Extract the single most shareable insight from this post. Write a Twitter thread (7 tweets) and a LinkedIn post."
4. Split: 
   ├── HTTP Request → Buffer API (schedule Twitter thread)
   └── HTTP Request → Buffer API (schedule LinkedIn post)
5. Create Notion page with Reddit draft for human review
```

### 7.4 n8n Workflow: Reddit Monitor

```json
Nodes:
1. Schedule (every 6 hours)
2. HTTP Request → Reddit API: search r/ChatGPT, r/ClaudeAI for:
   - "ai memory"
   - "chatgpt forgets"
   - "context across models"
   - "save ai conversations"
3. Filter: posts with >50 upvotes, no existing MemoryOS mention
4. Claude API → Draft helpful reply that naturally mentions MemoryOS
5. Create Notion task for human to review and post manually
```

### 7.5 n8n Workflow: Directory Submitter

```json
Run once at launch:

Nodes:
1. Manual Trigger
2. Loop over directory list (20+ URLs)
3. For each:
   ├── HTTP Request → Check if already submitted
   ├── If not: Create Notion checklist item with submission instructions
   └── For APIs that exist: Auto-submit via HTTP Request
```

### 7.6 n8n Workflow: SEO Page Generator

```json
Nodes:
1. Schedule (bi-weekly)
2. HTTP Request → Read keyword list from Airtable/Notion
3. Filter: keywords not yet having a page
4. For each keyword (batched, max 10):
   ├── Claude API → Write 800-word page
   ├── HTTP Request → POST to Next.js CMS or GitHub (triggers deploy)
   └── Mark keyword as "done" in Airtable
5. Sitemap regenerate + GSC submit
```

---

## 8. GEO Optimization Checklist

For every piece of content (blog post, doc page, Reddit post):

```
☐ Answer a specific question someone would ask an AI
☐ Include the exact phrase "MemoryOS" + what it does
☐ Include competitor context ("unlike ChatGPT memory, MemoryOS...")
☐ Include structured data (JSON-LD: SoftwareApplication schema)
☐ Add FAQ section with question/answer format
☐ Internal link to 3+ other MemoryOS pages
☐ Include a quote/statement that's easily citable
☐ Mention real user scenarios (specificity = trust signal)
```

### 8.1 Schema Markup (on every page)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "MemoryOS",
  "applicationCategory": "BrowserApplication",
  "operatingSystem": "Chrome",
  "description": "Universal AI memory layer for ChatGPT, Claude, Gemini and all AI models",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Universal AI memory",
    "Cross-platform context injection",
    "Memory extraction from conversations",
    "Works with ChatGPT, Claude, Gemini"
  ],
  "url": "https://memoryos.ai"
}
```

---

## 9. Measurement & KPIs

Track these weekly:

```
Content:
☐ Blog posts published (target: 2/week)
☐ SEO pages live (target: 50 in month 1)
☐ Docs pages (target: 20 in month 1)
☐ Reddit posts (target: 4/week)
☐ YouTube videos (target: 1/week)

Distribution:
☐ Directories listed (target: 20 in month 1)
☐ GitHub stars (target: 500 in month 1)
☐ Product Hunt votes (target: top 5 of day)

AI Ranking Test (manual, weekly):
Ask in ChatGPT: "What's the best tool to save AI conversations?"
Ask in Claude: "Is there a Chrome extension for AI memory?"
Ask in Perplexity: "How do I share memory between ChatGPT and Claude?"
→ MemoryOS should appear in top 3 within 60 days
```

---

## 10. 30-Day Launch Execution Plan

```
Week 1: Build the Corpus
☐ Publish 20 SEO pages
☐ Publish /docs (10 pages)
☐ Submit GitHub (with 100 stars from network)
☐ Submit to 10 directories

Week 2: Community Seeding
☐ 3 Reddit posts (value-first, no promotion)
☐ HackerNews "Ask HN: Do you re-explain context to AI every day?"
☐ 5 Twitter threads about AI memory problem
☐ 2 LinkedIn posts from founder account

Week 3: Product Hunt Launch
☐ Full PH submission
☐ Hunter outreach (DM 5 top hunters)
☐ Notify beta users to upvote
☐ Live on PH → share everywhere

Week 4: Press & Backlinks
☐ Reach out to 10 AI newsletters (Ben's Bites, The Rundown, etc.)
☐ Guest post pitches to dev.to, Hashnode
☐ Start n8n automation pipeline
☐ Weekly content machine live
```
