// Base adapter interface — TRD Section 5.2
export type Platform = "chatgpt" | "claude" | "gemini" | "grok";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationCapture {
  platform: Platform;
  session_url: string;
  messages: Message[];
  started_at: string;
  ended_at: string;
  project_id?: string | null;
}

export interface PlatformAdapter {
  platform: Platform;

  /**
   * Returns the toolbar element where the MemoryOS button should be injected.
   * Returns null if the toolbar can't be found yet (DOM not ready).
   */
  getToolbarEl(): Element | null;

  /**
   * Detect the current conversation on this platform.
   */
  detectConversation(): ConversationCapture | null;

  /**
   * Observe new messages in real-time.
   */
  observeNewMessages(callback: (msg: Message) => void): () => void;

  /**
   * Inject context string into the platform's prompt textarea.
   * Prepends context to whatever is already in the input.
   * Returns true on success.
   */
  injectContext(context: string): boolean;

  /**
   * Try to detect which project this conversation belongs to.
   */
  detectProject(): string | null;
}
