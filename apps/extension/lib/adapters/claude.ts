// Claude Platform Adapter — TRD Section 5.2
// Tested against claude.ai DOM (July 2025)

import type { ConversationCapture, Message, PlatformAdapter } from "./base";

// Claude DOM selectors
const SELECTORS = {
  humanTurn: '[data-testid="human-turn"]',
  assistantTurn: '[data-testid="assistant-turn"]',
  promptInput: '[contenteditable="true"][data-placeholder]',
  // Toolbar: the bottom bar of the composer with +, model, mic buttons
  // We inject after the last button in this row
  toolbarRow: 'fieldset > div:last-child, div[class*="composer"] > div:last-child',
  // More reliable: find the row containing the Sonnet model selector
  modelSelector: 'button[aria-label*="model" i], button[aria-label*="sonnet" i], button[data-testid*="model"]',
} as const;

export class ClaudeAdapter implements PlatformAdapter {
  platform = "claude" as const;

  getToolbarEl(): Element | null {
    // Scope all searches inside the composer fieldset to prevent sidebar items from matching
    const fieldset = document.querySelector("fieldset");
    if (!fieldset) return null;

    // Strategy 1: find the model selector row inside the fieldset
    const modelBtn = fieldset.querySelector(SELECTORS.modelSelector);
    if (modelBtn) {
      let el: Element | null = modelBtn;
      for (let i = 0; i < 4; i++) {
        el = el?.parentElement ?? null;
        if (el && el !== fieldset && el.tagName === "DIV" && el.querySelectorAll("button").length >= 2) {
          return el;
        }
      }
    }

    // Strategy 2: Find the last div containing multiple buttons inside the fieldset
    const divs = Array.from(fieldset.querySelectorAll("div"));
    for (const div of divs.reverse()) {
      if (div.querySelectorAll("button").length >= 2) {
        return div;
      }
    }

    return null;
  }

  detectConversation(): ConversationCapture | null {
    const messages = this._scrapeMessages();
    if (messages.length === 0) return null;
    return {
      platform: "claude",
      session_url: window.location.href,
      messages,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      project_id: this.detectProject(),
    };
  }

  private _scrapeMessages(): Message[] {
    const msgs: Message[] = [];
    
    // 1. Try finding by <article> elements (Claude's standard turn wrappers)
    const articles = Array.from(document.querySelectorAll('article'));
    if (articles.length > 0) {
      articles.forEach((article) => {
        // Assistant messages contain prose or assistant indicators, user messages are just bubbles
        const prose = article.querySelector('.prose, [data-testid="assistant-turn"], [class*="prose"]');
        const role = prose ? ('assistant' as const) : ('user' as const);
        
        // Grab content: prioritize prose text for assistant to avoid scraping metadata
        const contentEl = prose || article.querySelector('.break-words') || article;
        const content = contentEl.textContent?.trim() ?? "";
        
        if (content && content.length > 1) {
          msgs.push({
            role,
            content,
            timestamp: new Date().toISOString(),
          });
        }
      });
      if (msgs.length > 0) return msgs;
    }
    
    // 2. Fallback: Old visual-sorting DOM scraper
    const aiElements = Array.from(document.querySelectorAll('.prose, .font-claude-message, [data-testid="assistant-turn"]'));
    const userElements = Array.from(document.querySelectorAll('.break-words, .whitespace-pre-wrap, .font-user-message, [data-testid="human-turn"]'));
    
    const allElements = [...aiElements, ...userElements].filter(el => {
      const text = el.textContent?.trim() || '';
      return text.length > 1;
    });
    
    // Sort visually by top coordinate
    allElements.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    
    const seenText: string[] = [];
    allElements.forEach((el) => {
      const isClaude = aiElements.includes(el);
      const role = isClaude ? ('assistant' as const) : ('user' as const);
      const content = el.textContent?.trim() || '';
      
      let isDuplicate = false;
      for (const seen of seenText) {
        if (seen === content) {
          isDuplicate = true;
          break;
        }
        if (content.length > 30 && seen.length > 30) {
          if (seen.includes(content) || content.includes(seen)) {
            isDuplicate = true;
            break;
          }
        }
      }
      
      if (!isDuplicate && content.length > 1) {
        seenText.push(content);
        msgs.push({ role, content, timestamp: new Date().toISOString() });
      }
    });
    
    return msgs;
  }

  observeNewMessages(callback: (msg: Message) => void): () => void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.(SELECTORS.humanTurn)) {
            const c = node.textContent?.trim() ?? "";
            if (c) callback({ role: "user", content: c, timestamp: new Date().toISOString() });
          }
          if (node.matches?.(SELECTORS.assistantTurn)) {
            const c = node.textContent?.trim() ?? "";
            if (c) callback({ role: "assistant", content: c, timestamp: new Date().toISOString() });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }

  injectContext(context: string): boolean {
    // Claude uses contenteditable div with data-placeholder
    const inputs = document.querySelectorAll<HTMLElement>(SELECTORS.promptInput);
    let textarea: HTMLElement | null = null;
    inputs.forEach((el) => {
      if (el.getAttribute("aria-readonly") !== "true" && el.offsetParent !== null) {
        textarea = el;
      }
    });

    // Fallback: any visible contenteditable
    if (!textarea) {
      const all = document.querySelectorAll<HTMLElement>('[contenteditable="true"]');
      all.forEach((el) => {
        if (el.offsetParent !== null) textarea = el;
      });
    }

    if (!textarea) return false;

    const existing = (textarea as HTMLElement).innerText?.trim() ?? "";
    const newContent = existing ? `${context}\n\n${existing}` : context;

    (textarea as HTMLElement).focus();
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, newContent);

    // Dispatch input event for React state sync
    (textarea as HTMLElement).dispatchEvent(new InputEvent("input", { bubbles: true }));

    // Move cursor to end
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(textarea as HTMLElement);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);

    return true;
  }

  detectProject(): string | null {
    return null;
  }
}
