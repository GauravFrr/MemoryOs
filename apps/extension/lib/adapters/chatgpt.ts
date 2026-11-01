// ChatGPT Platform Adapter — TRD Section 5.2
// Tested against chat.openai.com / chatgpt.com DOM (July 2025)

import type { ConversationCapture, Message, PlatformAdapter } from "./base";

const SELECTORS = {
  messageContainer: "[data-message-author-role]",
  promptTextarea: "#prompt-textarea",
  // ChatGPT's bottom toolbar — the row with attachment, voice, send buttons
  // Typically: div containing the send button
  sendButton: 'button[data-testid="send-button"], button[aria-label*="Send"], button[aria-label*="send"]',
  toolbarRow: 'div[class*="flex"][class*="items-center"]:has(button[data-testid="send-button"])',
} as const;

export class ChatGPTAdapter implements PlatformAdapter {
  platform = "chatgpt" as const;

  getToolbarEl(): Element | null {
    // Scope search inside the active chat input area to prevent any sidebar matching
    const textarea = document.querySelector(SELECTORS.promptTextarea);
    if (!textarea) return null;

    let container: Element | null = textarea;
    for (let i = 0; i < 5; i++) {
      container = container?.parentElement ?? null;
      if (container && (container.tagName === "FORM" || container.querySelector(SELECTORS.sendButton))) {
        break;
      }
    }
    if (!container) return null;

    // Strategy 1: find row containing the send button inside the composer
    const sendBtn = container.querySelector(SELECTORS.sendButton);
    if (sendBtn) {
      let el: Element | null = sendBtn;
      for (let i = 0; i < 4; i++) {
        el = el?.parentElement ?? null;
        if (el && el !== container && el.tagName === "DIV" && el.querySelectorAll("button").length >= 2) {
          return el;
        }
      }
    }

    // Strategy 2: find the toolbar row inside the composer
    const toolbarRow = container.querySelector(SELECTORS.toolbarRow);
    if (toolbarRow) return toolbarRow;

    return null;
  }

  detectConversation(): ConversationCapture | null {
    const messages = this._scrapeMessages();
    if (messages.length === 0) return null;
    return {
      platform: "chatgpt",
      session_url: window.location.href,
      messages,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      project_id: this.detectProject(),
    };
  }

  private _scrapeMessages(): Message[] {
    const msgs: Message[] = [];
    
    const aiElements = Array.from(document.querySelectorAll('[data-message-author-role="assistant"], .markdown, [data-message-author="assistant"], [data-message-author="role"]'));
    const userElements = Array.from(document.querySelectorAll('[data-message-author-role="user"], .whitespace-pre-wrap, [data-message-author="user"], div[data-message-id]'));
    
    const allElements = [...aiElements, ...userElements].filter(el => {
      const text = el.textContent?.trim() || '';
      if (text.length < 2) return false;
      if (text.includes("What's on your mind today?")) return false;
      if (text.includes("ChatGPT can make mistakes")) return false;
      if (text.includes("How can I help you today?")) return false;
      return true;
    });
    
    allElements.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    
    const seenText: string[] = [];
    allElements.forEach((el) => {
      const isAI = aiElements.includes(el);
      const role = isAI ? ('assistant' as const) : ('user' as const);
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
          const role = node.getAttribute?.("data-message-author-role") as "user" | "assistant";
          if (role) {
            const c = node.textContent?.trim() ?? "";
            if (c) callback({ role, content: c, timestamp: new Date().toISOString() });
          }
        });
      });
    });
    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }

  injectContext(context: string): boolean {
    // ChatGPT uses a contenteditable div with id=prompt-textarea
    const textarea = document.querySelector<HTMLElement>(SELECTORS.promptTextarea);
    if (!textarea) return false;

    const existing = textarea.innerText?.trim() ?? "";
    const newContent = existing ? `${context}\n\n${existing}` : context;

    textarea.focus();
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, newContent);
    textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));

    return true;
  }

  detectProject(): string | null {
    return null;
  }
}
