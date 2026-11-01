# MemoryOS — UI/UX Design Brief
**Version:** 1.0

---

## 1. Design Philosophy

MemoryOS is not a note-taking app. It is not a chatbot. It is **infrastructure** — the memory layer underneath every AI tool you use. The design must feel:

- **Intelligent, not cluttered** — data-dense but never overwhelming
- **Trust-first** — privacy and user ownership must feel tangible
- **Surgical precision** — every element has a job
- **Dark-native** — power users, developers, and AI-heavy workflows live in the dark

The aesthetic reference point: **Linear meets Raycast meets Obsidian**. Not playful. Not corporate. Focused, fast, premium.

---

## 2. Color System

### 2.1 Core Palette

```
Background Layer 0 (deepest):  #0A0B0F  ← App chrome, sidebar
Background Layer 1 (base):     #0F1117  ← Main content area
Background Layer 2 (raised):   #161B27  ← Cards, panels
Background Layer 3 (float):    #1E2535  ← Modals, dropdowns, tooltips
```

### 2.2 Brand / Accent Colors

```
Primary (Neural Violet):       #7C5CFC  ← CTAs, active states, links
Primary Hover:                 #9B7EFD  ← Hover on primary
Primary Muted:                 #7C5CFC1A ← Subtle highlight backgrounds

Secondary (Memory Cyan):       #22D3EE  ← Memory type badges, graphs
Tertiary (Decision Amber):     #F59E0B  ← Decisions, warnings, score high

Positive (Save/Approve):       #10B981  ← Approve buttons, success states
Destructive (Delete/Reject):   #EF4444  ← Delete, reject, danger
```

### 2.3 Text Colors

```
Text Primary:     #F1F5F9  ← Main readable text
Text Secondary:   #94A3B8  ← Labels, metadata, subtitles
Text Tertiary:    #475569  ← Placeholder text, disabled
Text Accent:      #7C5CFC  ← Links, clickable labels
```

### 2.4 Borders & Dividers

```
Border Subtle:    #1E2535  ← Card borders, section dividers
Border Default:   #2D3748  ← Input borders, stronger dividers
Border Focus:     #7C5CFC  ← Focused inputs, selected cards
```

### 2.5 Memory Type Color Coding

Each memory type has its own color identity (used on badges and graph nodes):

```
Personal:    #7C5CFC  ← Violet    ("Who you are")
Preference:  #22D3EE  ← Cyan      ("How you work")
Tool:        #F59E0B  ← Amber     ("What you use")
Project:     #10B981  ← Emerald   ("What you build")
Workflow:    #3B82F6  ← Blue      ("How you build")
Decision:    #EF4444  ← Red       ("What you chose")
Template:    #8B5CF6  ← Purple    ("What you reuse")
Entity:      #EC4899  ← Pink      ("Who's involved")
```

---

## 3. Typography

### 3.1 Font Stack

```
Display / Headings:  "Inter" (variable, 400–700)
Body / UI:           "Inter" (same family, consistent)
Monospace / Code:    "JetBrains Mono" or "Geist Mono"
Data / Labels:       "Inter" (tabular nums variant)
```

> Why: Inter is the de-facto standard for developer tools. It's the right choice here — readable at small sizes, professional, not boring when used with good weight contrast. The boldness comes from sizing and color, not font swapping.

### 3.2 Type Scale

```
Display XL:    36px / 700 weight / -0.02em tracking   ← Page hero titles
Display L:     28px / 700 weight / -0.015em            ← Section headings
H1:            24px / 600 weight / -0.01em             ← Page titles
H2:            20px / 600 weight / -0.005em            ← Card titles, modal headings
H3:            16px / 600 weight / 0em                 ← Section labels
Body Large:    16px / 400 weight / 0.01em              ← Primary readable content
Body:          14px / 400 weight / 0.01em              ← Default text
Body Small:    13px / 400 weight / 0.01em              ← Metadata, captions
Label:         11px / 500 weight / 0.08em UPPERCASE    ← Category labels, badges
Mono:          13px / 400 weight / 0.02em              ← Code, JSON, structured data
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)
```
2px    ← xs: tight internal padding
4px    ← sm: icon margins, badge padding
8px    ← md: standard element gap
12px   ← lg: card internal padding
16px   ← xl: section internal padding
24px   ← 2xl: between cards
32px   ← 3xl: section separation
48px   ← 4xl: major section gap
64px   ← 5xl: hero spacing
```

### 4.2 Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│  TOPBAR (60px)                                       │
│  [Logo] [Search──────────────] [Notif] [Avatar]      │
├────────────┬─────────────────────────────────────────┤
│ SIDEBAR    │  MAIN CONTENT AREA                      │
│ (240px)    │                                         │
│            │  [Page Header]                          │
│ 🏠 Home    │                                         │
│ 📁 Projects│  [Content Grid / List]                  │
│ 🧠 Memories│                                         │
│ 💬 Chats   │                                         │
│ 🔍 Search  │                                         │
│ 📊 Stats   │                                         │
│            │                                         │
│ ──────     │                                         │
│ ⚙️ Settings│                                         │
│            │                                         │
└────────────┴─────────────────────────────────────────┘
```

### 4.3 Content Max Width

```
Dashboard content:  max-width: 1200px, centered
Reading content:    max-width: 720px
Full-width views:   (graph, analytics) → 100%
```

### 4.4 Grid System

```
Projects grid:    3 columns (desktop), 2 (tablet), 1 (mobile)
Memory list:      1 column, full width
Stats row:        4 columns (desktop), 2 (tablet)
Two-panel layout: 60% content / 40% sidebar panel
```

---

## 5. Component Library

### 5.1 Buttons

```
Primary:    bg-#7C5CFC  text-white   ← Main CTAs ("Inject", "Save Memory")
Secondary:  bg-#1E2535  text-#F1F5F9 border-#2D3748 ← Secondary actions
Ghost:      bg-transparent text-#94A3B8 hover:bg-#1E2535 ← Tertiary actions
Danger:     bg-#EF4444  text-white   ← Delete, reject
Success:    bg-#10B981  text-white   ← Approve, save confirmed
```

**Button sizes:**
```
sm:  px-3 py-1.5 text-13px rounded-md
md:  px-4 py-2   text-14px rounded-md  ← Default
lg:  px-5 py-2.5 text-16px rounded-lg
```

### 5.2 Cards

```
Base card:
  bg: #161B27
  border: 1px solid #1E2535
  border-radius: 12px
  padding: 16px
  hover: border-color: #2D3748, box-shadow: 0 0 0 1px #7C5CFC22

Active/Selected card:
  border-color: #7C5CFC
  box-shadow: 0 0 0 1px #7C5CFC
```

### 5.3 Memory Type Badge

```
[🔧 Tool]
  background: #F59E0B1A
  color: #F59E0B
  border: 1px solid #F59E0B33
  padding: 2px 8px
  border-radius: 999px
  font: 11px / 500 / uppercase

[📋 Workflow]
  background: #3B82F61A
  color: #3B82F6
  (same border/radius pattern)
```

### 5.4 Score Bar

```
Memory score (0–100) shown as:
[████████░░] 82

  Fill color changes:
  0–30:   #EF4444 (red, low value)
  31–60:  #F59E0B (amber, medium)
  61–80:  #22D3EE (cyan, good)
  81–100: #10B981 (green, high value)

Width: 80px, height: 4px, border-radius: 2px
```

### 5.5 Platform Badges

```
ChatGPT:  bg: #10B9811A  color: #10B981  icon: GPT logo
Claude:   bg: #F59E0B1A  color: #F59E0B  icon: Anthropic logo
Gemini:   bg: #3B82F61A  color: #3B82F6  icon: Gemini logo
Grok:     bg: #EC48991A  color: #EC4899  icon: X logo
```

### 5.6 Inputs

```
Base input:
  bg: #0F1117
  border: 1px solid #2D3748
  border-radius: 8px
  padding: 10px 12px
  font: 14px, text-#F1F5F9
  placeholder: text-#475569

Focus:
  border-color: #7C5CFC
  box-shadow: 0 0 0 3px #7C5CFC1A
  outline: none
```

### 5.7 Sidebar Navigation Items

```
Default:
  color: #94A3B8
  hover: bg-#161B27, color-#F1F5F9

Active:
  bg: #7C5CFC1A
  color: #7C5CFC
  border-left: 2px solid #7C5CFC
  font-weight: 500
```

### 5.8 Modals

```
Overlay: rgba(0, 0, 0, 0.6) backdrop-blur(4px)
Modal:   bg-#161B27, border-#2D3748, rounded-16px
Header:  24px font, border-bottom-#1E2535, pb-16px
Footer:  border-top-#1E2535, pt-16px, flex justify-end gap-8px
Max-width: 520px (standard) | 720px (large)
```

### 5.9 Toast Notifications

```
Success: bg-#10B9811A border-#10B981 text-#10B981
Error:   bg-#EF44441A border-#EF4444 text-#EF4444
Info:    bg-#7C5CFC1A border-#7C5CFC text-#7C5CFC
Warning: bg-#F59E0B1A border-#F59E0B text-#F59E0B

Position: bottom-right, stack up
Duration: 4 seconds
```

---

## 6. Extension Sidebar Design

```
Width: 340px
Bg: #0A0B0F
Border-left: 1px solid #1E2535
Shadow: -8px 0 24px rgba(0,0,0,0.4)

Header: 56px, border-bottom: #1E2535
Tab bar: 3 tabs, 40px height, bg-#0F1117
Content area: scrollable, padding 12px
Footer: 48px, border-top: #1E2535
```

**Inject button (primary CTA in extension):**
```
Full width
bg: linear-gradient(135deg, #7C5CFC, #22D3EE)
text: white, font-weight: 600
height: 44px
border-radius: 10px
hover: opacity 0.9, slight scale up (1.01)
```

---

## 7. Micro-interactions & Animation

### 7.1 Transitions
```
All interactive elements: transition: all 150ms ease
Cards hover: 150ms
Sidebar open/close: 200ms slide
Modal appear: 200ms scale(0.95→1) + fade
Page transitions: 150ms fade
```

### 7.2 Signature Element (The Memory Pulse)
```
The one unique design element:

When a memory is approved or injected:
→ A soft violet ripple emanates from the memory card
→ Ripple color: #7C5CFC at 40% opacity
→ Expands 0 → 40px radius in 400ms
→ Fades out
→ Card briefly glows border: #7C5CFC

This represents "memory locking in" — 
reinforces the product metaphor of building a brain.
```

### 7.3 Loading States
```
Skeleton loaders: bg-#1E2535, shimmer animation
Memory extraction spinner: rotating brain icon (custom SVG)
Search: debounce 300ms, inline spinner in search bar
```

### 7.4 Empty States
```
No memories: Illustration of empty vault + "Add your first memory"
No projects: Simple icon + "Create your first project"
No search results: "Nothing found — try different keywords"
(No generic sad-face illustrations — keep it dry and direct)
```

---

## 8. Responsive Breakpoints

```
Mobile (< 640px):  Single column, no sidebar (hamburger nav)
Tablet (640–1024): Sidebar collapses to icons only (60px)
Desktop (> 1024):  Full sidebar (240px) + content
Wide (> 1440px):   Content max-width kicks in (centered)
```

---

## 9. Iconography

```
Library: Lucide React (line icons, 1.5px stroke)
Size:    16px (small), 20px (default), 24px (prominent)
Color:   match text context (secondary for inactive, primary for active)
```

Custom icons needed (SVG):
- Brain (memory vault icon)
- Memory pulse (animation element)
- MemoryOS logo mark

---

## 10. Accessibility

```
Contrast ratio: minimum 4.5:1 (text on bg)
Focus indicators: 2px violet ring on all interactive elements
Keyboard navigation: Full tab order, escape to close modals
Reduced motion: @media (prefers-reduced-motion) → disable animations
Screen reader: aria-labels on all icon-only buttons
```

---

## 11. Design Tokens (CSS Variables)

```css
:root {
  /* Backgrounds */
  --bg-0: #0A0B0F;
  --bg-1: #0F1117;
  --bg-2: #161B27;
  --bg-3: #1E2535;

  /* Brand */
  --primary: #7C5CFC;
  --primary-hover: #9B7EFD;
  --primary-muted: #7C5CFC1A;
  --secondary: #22D3EE;
  --tertiary: #F59E0B;

  /* Text */
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-tertiary: #475569;

  /* Status */
  --success: #10B981;
  --danger: #EF4444;
  --warning: #F59E0B;
  --info: #3B82F6;

  /* Borders */
  --border-subtle: #1E2535;
  --border-default: #2D3748;
  --border-focus: #7C5CFC;

  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 999px;
}
```
