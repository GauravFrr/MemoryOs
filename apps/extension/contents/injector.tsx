// MemoryOS Native Injector — contents/injector.tsx
// Injects a 🧠 Memory button directly into Claude's / ChatGPT's toolbar.
// No sidebar, no page push, no shadow DOM overlay.
// A floating popover appears above the button on click.

import type { PlasmoCSConfig } from "plasmo";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { MemoryPopover } from "../components/Popover/MemoryPopover";
import { getAdapter, isSupportedPlatform } from "../lib/adapters/registry";
import type { PlatformAdapter } from "../lib/adapters/base";

// ── Plasmo config ───────────────────────────────────────────────────────────
export const config: PlasmoCSConfig = {
  matches: [
    "https://chat.openai.com/*",
    "https://chatgpt.com/*",
    "https://claude.ai/*",
  ],
  all_frames: false,
  run_at: "document_idle",
};

// ── Button styles (inline — matches platform toolbar button look) ───────────
function getButtonStyle(platform: string, hovered: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    transition: "all 120ms ease",
    userSelect: "none" as const,
    lineHeight: 1.2,
    flexShrink: 0,
    outline: "none",
  };

  if (platform === "claude") {
    return {
      ...base,
      background: hovered ? "rgba(255, 255, 255, 0.06)" : "transparent",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      color: hovered ? "#f5f5f0" : "#b4b4b0",
    };
  } else {
    // ChatGPT
    return {
      ...base,
      background: hovered ? "rgba(255, 255, 255, 0.08)" : "transparent",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: hovered ? "#ffffff" : "#c5c5d2",
    };
  }
}

// ── Wrapper component: button + popover ────────────────────────────────────
function MemoryButton({ adapter }: { adapter: PlatformAdapter }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const btnStyle = getButtonStyle(adapter.platform, hovered);

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
    >
      <button
        id="memoryos-inject-btn"
        title="MemoryOS — inject context into prompt"
        style={btnStyle}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        🧠 <span>Memory</span>
      </button>

      {open && (
        <MemoryPopover
          adapter={adapter}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

// ── Main injection logic ───────────────────────────────────────────────────
const INJECTION_ID = "memoryos-btn-root";
let injectionAttempts = 0;

function injectButton(adapter: PlatformAdapter) {
  // Don't inject twice
  if (document.getElementById(INJECTION_ID)) return;

  const toolbar = adapter.getToolbarEl();
  if (!toolbar) {
    // Retry up to 20 times with increasing backoff (DOM may not be ready)
    if (injectionAttempts < 20) {
      injectionAttempts++;
      setTimeout(() => injectButton(adapter), 300 + injectionAttempts * 100);
    }
    return;
  }

  // Create host element
  const host = document.createElement("div");
  host.id = INJECTION_ID;
  host.style.display = "inline-flex";
  host.style.alignItems = "center";

  // Inject: append to end of toolbar row
  toolbar.appendChild(host);

  // Mount React
  const root = createRoot(host);
  root.render(<MemoryButton adapter={adapter} />);
}

// ── Entry point ────────────────────────────────────────────────────────────
function main() {
  if (!isSupportedPlatform()) return;

  const adapter = getAdapter();
  if (!adapter) return;

  // First attempt
  injectButton(adapter);

  // Re-inject on SPA navigation (Claude / ChatGPT use client-side routing)
  const observer = new MutationObserver(() => {
    if (!document.getElementById(INJECTION_ID)) {
      injectionAttempts = 0;
      injectButton(adapter);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}

// Plasmo requires a default export for content scripts
export default function NullComponent() {
  return null;
}
