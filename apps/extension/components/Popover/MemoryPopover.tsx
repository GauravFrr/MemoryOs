// MemoryPopover — Floating dropdown menu matching Claude/ChatGPT native style exactly.
// Features nested side-flyout menus (submenus) just like Claude's "More models" flyout!
// Pure inline styles. Adapts colors, font, shadow, and hover states dynamically to the platform.

import React, { useState, useCallback, useRef, useEffect } from "react";
import { apiFetch, refreshSilentToken } from "../../api";
import type { PlatformAdapter } from "../../lib/adapters/base";
import { Storage } from "@plasmohq/storage";

// ──────────────────────────────────────────────────────────────────────────────
// Platform Theme Tokens
// ──────────────────────────────────────────────────────────────────────────────
function getPlatformTheme(platform: string) {
  if (platform === "claude") {
    return {
      bg: "#222220", // Claude dark dropdown bg
      bgSubmenu: "#2b2b29", // Submenu slightly lighter/offset bg
      bgInput: "#1b1b19",
      bgHover: "rgba(255, 255, 255, 0.06)",
      border: "rgba(255, 255, 255, 0.08)",
      text: "#f5f5f0",
      textMuted: "#b4b4b0",
      textDim: "#858580",
      accent: "#d97753", // Claude terracotta
      accentHover: "#e68864",
      radius: "12px",
      radiusSm: "8px",
      shadow: "0 12px 24px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.3)",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    };
  } else {
    // ChatGPT
    return {
      bg: "#212121",
      bgSubmenu: "#2f2f2f",
      bgInput: "#0d0d0d",
      bgHover: "rgba(255, 255, 255, 0.08)",
      border: "rgba(255, 255, 255, 0.15)",
      text: "#ececf1",
      textMuted: "#b4b4b4",
      textDim: "#8e8ea0",
      accent: "#10a37f", // ChatGPT green
      accentHover: "#1a7f64",
      radius: "12px",
      radiusSm: "8px",
      shadow: "0 12px 24px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.3)",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles Generator
// ──────────────────────────────────────────────────────────────────────────────
function getStyles(T: ReturnType<typeof getPlatformTheme>) {
  return {
    menu: {
      position: "absolute" as const,
      bottom: "calc(100% + 8px)",
      right: "0",
      width: "230px",
      background: T.bg,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      boxShadow: T.shadow,
      padding: "6px",
      zIndex: 2147483647,
      fontFamily: T.fontFamily,
      fontSize: "13px",
      color: T.text,
      userSelect: "none" as const,
      display: "flex",
      flexDirection: "column" as const,
      gap: "2px",
    },
    submenu: {
      position: "absolute" as const,
      bottom: "-6px", // Align nicely with hover item
      right: "100%", // Open to the left of the main menu (since button is right-aligned)
      marginRight: "8px",
      width: "240px",
      background: T.bgSubmenu,
      border: `1px solid ${T.border}`,
      borderRadius: T.radius,
      boxShadow: T.shadow,
      padding: "6px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "2px",
      maxHeight: "300px",
      overflowY: "auto" as const,
    },
    item: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      borderRadius: T.radiusSm,
      cursor: "pointer",
      color: T.text,
      transition: "background 100ms",
      fontWeight: 400,
    },
    itemActive: {
      color: T.accent,
      fontWeight: 500,
    },
    arrow: {
      fontSize: "11px",
      color: T.textDim,
      marginLeft: "6px",
    },
    checkmark: {
      fontSize: "12px",
      color: T.accent,
      fontWeight: "bold",
    },
    divider: {
      height: "1px",
      background: T.border,
      margin: "4px 6px",
    },
    inputWrapper: {
      padding: "6px",
    },
    input: {
      width: "100%",
      background: T.bgInput,
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusSm,
      color: T.text,
      padding: "7px 10px",
      fontSize: "12px",
      outline: "none",
      fontFamily: "inherit",
      boxSizing: "border-box" as const,
    },
    infoText: {
      fontSize: "11px",
      color: T.textDim,
      padding: "6px 12px",
      lineHeight: 1.4,
    },
    spinner: {
      width: "12px",
      height: "12px",
      border: "2px solid rgba(255,255,255,0.25)",
      borderTopColor: "white",
      borderRadius: "50%",
      animation: "memoryos-spin 0.7s linear infinite",
    },
  };
}

// Inject keyframe animation once
let spinnerInjected = false;
function ensureSpinnerStyle() {
  if (spinnerInjected) return;
  spinnerInjected = true;
  const st = document.createElement("style");
  st.textContent = `@keyframes memoryos-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(st);
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface Project {
  id: string;
  name: string;
}

interface InjectionResult {
  context_string: string;
  memories_used: number;
  token_estimate: number;
}

interface Props {
  adapter: PlatformAdapter;
  onClose: () => void;
}

export function MemoryPopover({ adapter, onClose }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InjectionResult | null>(null);
  const [injected, setInjected] = useState(false);
  const [chatInjected, setChatInjected] = useState(false);
  const [saved, setSaved] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugCookies, setDebugCookies] = useState<string[]>([]);

  // Diagnostic: Read cookie list from storage on error
  useEffect(() => {
    if (error) {
      const storage = new Storage({ area: "local" });
      storage.get("debug-cookies").then((val: any) => {
        if (Array.isArray(val)) setDebugCookies(val);
      });
    }
  }, [error]);

  // Poll for message count
  useEffect(() => {
    const updateCount = () => {
      const capture = adapter.detectConversation();
      setMsgCount(capture ? capture.messages.length : 0);
    };
    updateCount();
    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, [adapter]);

  // Submenu state: "none" | "projects" | "topic"
  const [activeSubmenu, setActiveSubmenu] = useState<"none" | "projects" | "topic">("none");

  // Hover states for list items
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const T = getPlatformTheme(adapter.platform);
  const s = getStyles(T);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  ensureSpinnerStyle();

  // Proactively refresh Clerk token silently in the background on mount
  useEffect(() => {
    refreshSilentToken().catch(() => {});
  }, []);

  // Load Projects
  useEffect(() => {
    apiFetch("/projects")
      .then((data: any) => {
        const list: Project[] = Array.isArray(data) ? data : data.projects ?? [];
        setProjects(list);
        if (list.length > 0) setProjectId(list[0].id);
      })
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 100);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Focus input when topic submenu opens
  useEffect(() => {
    if (activeSubmenu === "topic" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [activeSubmenu]);

  const handleFindAndInject = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setInjected(false);
    setSaved(false);

    try {
      const body: Record<string, unknown> = {
        platform: adapter.platform,
        max_tokens: 1200,
      };
      if (projectId) body.project_id = projectId;
      if (topic.trim()) body.topic = topic.trim();

      const data: InjectionResult = await apiFetch("/inject/build", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setResult(data);

      if (data.memories_used > 0) {
        const ok = adapter.injectContext(data.context_string);
        if (ok) {
          setInjected(true);
          setTimeout(() => onClose(), 2000);
        } else {
          setError("Textarea not found.");
        }
      } else {
        // No memories found, keep menu open to let them change topic/project
        setActiveSubmenu("none");
      }
    } catch (err: any) {
      setError(err.message ?? "API error");
    } finally {
      setLoading(false);
    }
  }, [projectId, topic, adapter, onClose]);

  const handleInjectThisChat = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setInjected(false);
    setChatInjected(false);
    setSaved(false);

    try {
      const capture = adapter.detectConversation();
      if (!capture || capture.messages.length === 0) {
        throw new Error("No messages found in this chat.");
      }

      const sessionUrl = capture.session_url || window.location.href;

      // Step 1: Check if this chat is already saved by URL
      let existing: any = null;
      try {
        existing = await apiFetch(`/conversations/by-url?url=${encodeURIComponent(sessionUrl)}`);
      } catch {
        // Not found or error — will auto-save below
      }

      // Step 2: If not saved, auto-save the chat first
      if (!existing) {
        const payload = {
          platform: capture.platform,
          projectId: projectId || undefined,
          sessionUrl,
          startedAt: capture.started_at,
          endedAt: capture.ended_at,
          messages: capture.messages.map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          title: `Chat on ${capture.platform} (${new Date().toLocaleDateString()})`,
        };
        await apiFetch("/conversations", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      // Step 3: Call inject/build with chat_summary mode
      const body: Record<string, unknown> = {
        platform: adapter.platform,
        max_tokens: 1200,
        mode: "chat_summary",
        session_url: sessionUrl,
      };
      if (projectId) body.project_id = projectId;

      const data: InjectionResult = await apiFetch("/inject/build", {
        method: "POST",
        body: JSON.stringify(body),
      });

      setResult(data);

      if (data.memories_used > 0) {
        const ok = adapter.injectContext(data.context_string);
        if (ok) {
          setChatInjected(true);
          setTimeout(() => onClose(), 2000);
        } else {
          setError("Textarea not found.");
        }
      } else {
        setError("Could not generate chat summary. Try again.");
      }
    } catch (err: any) {
      setError(err.message ?? "API error");
    } finally {
      setLoading(false);
    }
  }, [projectId, adapter, onClose]);

  const handleSaveConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setInjected(false);
    setSaved(false);

    try {
      const capture = adapter.detectConversation();
      if (!capture || capture.messages.length === 0) {
        throw new Error("No messages found in this chat to save.");
      }

      const payload = {
        platform: capture.platform,
        projectId: projectId || undefined,
        sessionUrl: capture.session_url,
        startedAt: capture.started_at,
        endedAt: capture.ended_at,
        messages: capture.messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
        title: `Chat on ${capture.platform} (${new Date().toLocaleDateString()})`,
      };

      await apiFetch("/conversations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSaved(true);
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err.message ?? "Failed to save chat");
    } finally {
      setLoading(false);
    }
  }, [projectId, adapter, onClose]);

  const getSelectedProjectName = () => {
    if (!projectId) return "All projects";
    const found = projects.find((p) => p.id === projectId);
    return found ? found.name : "Selected project";
  };

  return (
    <div ref={cardRef} style={s.menu}>
      {/* Header with Brand & Message Count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px 4px 10px" }}>
        <span style={{ fontSize: "10px", fontWeight: 600, color: T.textMuted, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          MemoryOS
        </span>
        <span style={{ fontSize: "10px", color: T.accent, background: `${T.accent}18`, padding: "2px 6px", borderRadius: "10px", fontWeight: 600 }}>
          {msgCount} messages
        </span>
      </div>
      
      <div style={s.divider} />

      {/* 1. Project Selector item */}
      <div
        style={{
          ...s.item,
          background: hoveredItem === "projects" || activeSubmenu === "projects" ? T.bgHover : "transparent",
        }}
        onMouseEnter={() => {
          setHoveredItem("projects");
          setActiveSubmenu("projects");
        }}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "11px", color: T.textMuted }}>Project</span>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>
            {getSelectedProjectName().length > 18
              ? getSelectedProjectName().slice(0, 18) + "..."
              : getSelectedProjectName()}
          </span>
        </span>
        <span style={s.arrow}>&gt;</span>
      </div>

      {/* 2. Topic item */}
      <div
        style={{
          ...s.item,
          background: hoveredItem === "topic" || activeSubmenu === "topic" ? T.bgHover : "transparent",
        }}
        onMouseEnter={() => {
          setHoveredItem("topic");
          setActiveSubmenu("topic");
        }}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <span style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "11px", color: T.textMuted }}>Topic search</span>
          <span style={{ fontSize: "13px", fontWeight: 500, color: topic ? T.text : T.textDim }}>
            {topic ? (topic.length > 18 ? topic.slice(0, 18) + "..." : topic) : "None (fast inject)"}
          </span>
        </span>
        <span style={s.arrow}>&gt;</span>
      </div>

      <div style={s.divider} />

      {/* 3. Main Action button — Global Memory Inject */}
      <div
        style={{
          ...s.item,
          ...s.itemActive,
          background: hoveredItem === "inject" ? T.bgHover : "transparent",
        }}
        onMouseEnter={() => {
          setHoveredItem("inject");
          setActiveSubmenu("none");
        }}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          if (!loading) handleFindAndInject();
        }}
      >
        <span>{injected ? "✓ Context Injected!" : "🧠 Find & Inject"}</span>
        {loading && hoveredItem === "inject" && <div style={s.spinner} />}
      </div>

      {/* 4. New: Inject This Chat Summary */}
      <div
        style={{
          ...s.item,
          color: chatInjected ? T.accent : T.text,
          fontWeight: 500,
          background: hoveredItem === "inject-chat" ? T.bgHover : "transparent",
        }}
        onMouseEnter={() => {
          setHoveredItem("inject-chat");
          setActiveSubmenu("none");
        }}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          if (!loading) handleInjectThisChat();
        }}
      >
        <span>{chatInjected ? "✓ Chat Summary Injected!" : "📄 Inject This Chat"}</span>
        {loading && hoveredItem === "inject-chat" && <div style={s.spinner} />}
      </div>

      {/* 5. Secondary Action button — Save & Extract */}
      <div
        style={{
          ...s.item,
          color: T.accent,
          fontWeight: 500,
          background: hoveredItem === "save-chat" ? T.bgHover : "transparent",
        }}
        onMouseEnter={() => {
          setHoveredItem("save-chat");
          setActiveSubmenu("none");
        }}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => {
          if (!loading) handleSaveConversation();
        }}
      >
        <span>{saved ? "✓ Chat Saved & Syncing!" : "💾 Save & Extract Chat"}</span>
        {loading && hoveredItem === "save-chat" && <div style={s.spinner} />}
      </div>

      {/* Status Indicators */}
      {error && (
        <div style={{ padding: "6px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ ...s.infoText, color: "#ef4444", padding: 0 }}>
            {error}
            {debugCookies.length > 0 && (
              <div style={{ fontSize: "8px", color: "#8888aa", marginTop: "4px", lineHeight: "1.2", overflowWrap: "anywhere" }}>
                Active domains: {debugCookies.join(", ")}
              </div>
            )}
          </div>
          {(error.toLowerCase().includes("token") || error.toLowerCase().includes("unauthorized") || error.toLowerCase().includes("expired")) && (
            <button
              onClick={() => window.open("http://localhost:3000", "_blank")}
              style={{
                width: "100%",
                padding: "8px",
                background: T.accent,
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 600,
                textAlign: "center",
                boxShadow: `0 2px 6px ${T.accent}25`,
                transition: "background 100ms",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = T.accentHover}
              onMouseLeave={(e) => e.currentTarget.style.background = T.accent}
            >
              🔄 Refresh Auth Session
            </button>
          )}
        </div>
      )}
      {result && result.memories_used === 0 && !loading && (
        <div style={s.infoText}>No memories found. Try changing the project or topic.</div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          SUBMENUS (Flyout Leftward)
          ──────────────────────────────────────────────────────────────────────── */}

      {/* Submenu A: Projects List */}
      {activeSubmenu === "projects" && (
        <div
          style={s.submenu}
          onMouseEnter={() => setActiveSubmenu("projects")}
          onMouseLeave={() => setActiveSubmenu("none")}
        >
          {/* All projects option */}
          <div
            style={{
              ...s.item,
              background: hoveredItem === "proj-all" ? T.bgHover : "transparent",
            }}
            onMouseEnter={() => setHoveredItem("proj-all")}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => {
              setProjectId("");
              setResult(null);
              setActiveSubmenu("none");
            }}
          >
            <span>All projects</span>
            {!projectId && <span style={s.checkmark}>✓</span>}
          </div>

          {projects.map((p) => (
            <div
              key={p.id}
              style={{
                ...s.item,
                background: hoveredItem === p.id ? T.bgHover : "transparent",
              }}
              onMouseEnter={() => setHoveredItem(p.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                setProjectId(p.id);
                setResult(null);
                setActiveSubmenu("none");
              }}
            >
              <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {p.name}
              </span>
              {projectId === p.id && <span style={s.checkmark}>✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Submenu B: Topic Search Field */}
      {activeSubmenu === "topic" && (
        <div
          style={s.submenu}
          onMouseEnter={() => setActiveSubmenu("topic")}
          onMouseLeave={() => setActiveSubmenu("none")}
        >
          <div style={s.inputWrapper}>
            <input
              ref={inputRef}
              style={s.input}
              type="text"
              placeholder="Type topic & press Enter..."
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFindAndInject();
                }
              }}
            />
          </div>
          <div style={s.infoText}>
            Topic semantic search finds memories matching this keyword. Leave blank to inject top score memories directly.
          </div>
        </div>
      )}
    </div>
  );
}
