# Chrome Extension Architecture & Platform Adapters

The **MemoryOS Chrome Extension** is built with **Plasmo** and **React 18** under Manifest V3 (MV3). It serves as the primary touchpoint between users and their AI sessions on **Claude**, **ChatGPT**, and **Gemini**.

---

## 1. Design Philosophy: Native Inline Injection

Earlier iterations of AI memory tools used fixed right-hand sidebar panels that disrupted responsive layouts and created visual clutter. MemoryOS adopts an **unobtrusive native injection model**:

1. A **🧠 Memory** button is inserted directly into the native toolbar beside the prompt box.
2. Clicking the button opens a floating **`MemoryPopover`** positioned directly above the button.
3. Upon selecting a project or topic, **"Find & Inject"** queries the API and prepends structured context directly into the platform's input editor in a single click.

```
┌─────────────────────────────────────────────────────────────┐
│  AI Chat Platform (Claude / ChatGPT)                        │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ MemoryPopover (Floating)                              │  │
│  │ ┌───────────────────────────────────────────────────┐ │  │
│  │ │ Project: [ E-Commerce App ▼ ]                     │ │  │
│  │ │ Topic:   [ Tailwind color rules                 ] │ │  │
│  │ │ [ 🧠 Find & Inject Context                      ] │ │  │
│  │ └───────────────────────────────────────────────────┘ │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ Pointing to                   │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [ Prompt Input Box                                  ] │  │
│  │ [ 📎 Attach ] [ 🧠 Memory ] [ Model: Claude 3.7 ]     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure (`apps/extension`)

```
apps/extension/
├── assets/                  # Extension icons (16, 48, 128px)
├── components/
│   ├── Popover/
│   │   └── MemoryPopover.tsx# Floating context selection & injection UI
│   └── Sidebar/             # Legacy standalone panel components
├── contents/
│   ├── injector.tsx         # Main Plasmo content script (DOM injection)
│   └── auth-sync.ts         # Clerk session token sync content script
├── lib/
│   └── adapters/
│       ├── base.ts          # PlatformAdapter interface & shared types
│       ├── chatgpt.ts       # ChatGPT DOM selectors & input handlers
│       ├── claude.ts        # Claude DOM selectors & input handlers
│       └── registry.ts      # URL matching & adapter factory
├── popup/
│   └── index.tsx            # Extension popup menu (user status, sync switch)
├── background.ts            # Background service worker (messaging, alarms)
├── package.json             # Plasmo configuration & dependencies
└── tsconfig.json            # Extension TypeScript configuration
```

---

## 3. Platform Adapter Pattern

Different AI interfaces use varying DOM structures, custom editors (`contenteditable` divs vs `<textarea>`), and dynamic React component mount points. Platform-specific logic is abstracted behind the `PlatformAdapter` interface:

```typescript
export interface PlatformAdapter {
  platform: 'claude' | 'chatgpt' | 'gemini';
  
  // Element queries
  getPromptContainer(): HTMLElement | null;
  getToolbarContainer(): HTMLElement | null;
  getTextarea(): HTMLElement | HTMLTextAreaElement | null;
  
  // Injection & text manipulation
  insertText(text: string): boolean;
  getExistingText(): string;
}
```

### Supported Platform Implementations

#### Claude Adapter (`lib/adapters/claude.ts`)
- **Container**: Scoped within the prompt footer `<fieldset>` container to avoid matching sidebar chat list titles.
- **Input Field**: Target is a ProseMirror `contenteditable` division.
- **Text Insertion**: Dispatches synthetic `input` and `textInput` events with `bubbles: true` so Claude's internal React state registers the injected context.

#### ChatGPT Adapter (`lib/adapters/chatgpt.ts`)
- **Container**: Anchored beside the action button row in `form #prompt-textarea`.
- **Input Field**: Targets `#prompt-textarea`.
- **Text Insertion**: Updates value and fires native React input setter to bypass React 18 event virtualization.

---

## 4. Authentication Synchronization (`contents/auth-sync.ts`)

The extension communicates with `apps/api` using the user's Clerk session:

1. When a user logs in to the dashboard at `http://localhost:3000` (or `app.memoryos.ai`), the content script `auth-sync.ts` detects the active Clerk session.
2. The session JWT is stored in `chrome.storage.local` under the key `memoryos_clerk_token`.
3. Extension API requests (`apps/extension/api.ts`) read this token and attach it as `Authorization: Bearer <token>`.

---

## 5. Development & Testing Workflow

### Building the Extension

```bash
# Run Plasmo development server with hot-reload
pnpm --filter @memoryos/extension dev
```

### Loading in Google Chrome / Chromium

1. Open your browser and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top right.
3. Click **Load unpacked**.
4. Select the build directory: `F:\MemoryOS\apps\extension\build\chrome-mv3-dev`.
5. Open [Claude](https://claude.ai) or [ChatGPT](https://chatgpt.com) — the **🧠 Memory** button will appear in the prompt toolbar.
