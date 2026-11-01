// Adapter Registry — auto-detects which platform adapter to use based on current URL
import { ChatGPTAdapter } from './chatgpt';
import { ClaudeAdapter } from './claude';
import type { PlatformAdapter } from './base';

const PLATFORM_URLS: Record<string, () => PlatformAdapter> = {
  'chat.openai.com': () => new ChatGPTAdapter(),
  'chatgpt.com': () => new ChatGPTAdapter(),
  'claude.ai': () => new ClaudeAdapter(),
};

let _cachedAdapter: PlatformAdapter | null = null;

/**
 * Returns the appropriate platform adapter for the current page URL.
 * Returns null if the current page is not a supported AI platform.
 */
export function getAdapter(): PlatformAdapter | null {
  if (_cachedAdapter) return _cachedAdapter;

  const hostname = window.location.hostname.replace(/^www\./, '');

  for (const [domain, factory] of Object.entries(PLATFORM_URLS)) {
    if (hostname === domain || hostname.endsWith('.' + domain)) {
      _cachedAdapter = factory();
      return _cachedAdapter;
    }
  }

  return null;
}

/**
 * Returns true if the current page is a supported AI platform.
 */
export function isSupportedPlatform(): boolean {
  return getAdapter() !== null;
}

/**
 * Returns the platform name for the current page.
 */
export function getCurrentPlatform(): string | null {
  const adapter = getAdapter();
  return adapter?.platform ?? null;
}
