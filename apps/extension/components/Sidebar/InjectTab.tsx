// InjectTab — Wired to POST /inject/build
// Shows token_estimate + memories_used preview, then injects via platform adapter

import React, { useState, useCallback } from 'react';
import { apiFetch } from '../../api';
import type { PlatformAdapter } from '../../lib/adapters/base';

interface Props {
  adapter: PlatformAdapter | null;
  projectId: string | null;
  platform: string;
}

interface InjectionResult {
  context_string: string;
  memories_used: number;
  token_estimate: number;
}

// Parse the bullet-list from context_string for preview
function parseMemoryBullets(contextString: string): string[] {
  const lines = contextString.split('\n');
  return lines
    .filter((l) => l.trim().startsWith('•'))
    .map((l) => l.replace(/^[•\s]+/, '').trim());
}

export function InjectTab({ adapter, projectId, platform }: Props) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<InjectionResult | null>(null);
  const [injected, setInjected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuild = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInjected(false);
    setPreview(null);

    try {
      const body: Record<string, unknown> = {
        platform,
        max_tokens: 1000,
      };
      if (projectId) body.project_id = projectId;
      if (topic.trim()) body.topic = topic.trim();

      const result: InjectionResult = await apiFetch('/inject/build', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setPreview(result);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch context. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [topic, projectId, platform]);

  const handleInject = useCallback(() => {
    if (!preview || !adapter) return;

    const success = adapter.injectContext(preview.context_string);
    if (success) {
      setInjected(true);
      setTimeout(() => setInjected(false), 3000);
    } else {
      setError('Could not find the prompt input on this page. Click the textarea first, then try again.');
    }
  }, [preview, adapter]);

  const bullets = preview ? parseMemoryBullets(preview.context_string) : [];

  return (
    <div className="inject-tab">
      {/* Topic input */}
      <div className="topic-input-wrapper">
        <label htmlFor="memoryos-topic">Topic (optional)</label>
        <input
          id="memoryos-topic"
          className="topic-input"
          type="text"
          placeholder="e.g. dark mode, video animation, React..."
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setPreview(null);
          }}
        />
      </div>

      {/* Build button */}
      {!preview && (
        <button
          className="btn-inject"
          onClick={handleBuild}
          disabled={loading || !adapter}
        >
          {loading ? (
            <><div className="spinner" /> Building context...</>
          ) : (
            <>🧠 Find Relevant Memories</>
          )}
        </button>
      )}

      {/* No adapter warning */}
      {!adapter && (
        <div className="alert alert-error">
          This page is not a supported AI platform. Open ChatGPT or Claude to use injection.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Preview */}
      {preview && (
        <>
          {/* Stats row */}
          <div className="inject-meta-row">
            <div className="inject-meta-card">
              <div className="label">Memories</div>
              <div className="value">{preview.memories_used}</div>
            </div>
            <div className="inject-meta-card">
              <div className="label">~Tokens</div>
              <div className="value">{preview.token_estimate}</div>
            </div>
          </div>

          {/* Memory preview pills */}
          {bullets.length > 0 && (
            <div className="memory-pills">
              <div className="memory-pills-header">Preview</div>
              {bullets.map((text, i) => (
                <div key={i} className="memory-pill">
                  <div className="memory-pill-dot" />
                  <div className="memory-pill-text">{text}</div>
                </div>
              ))}
            </div>
          )}

          {/* No memories found */}
          {preview.memories_used === 0 && (
            <div className="alert alert-info">
              No memories found for this project yet. Approve some memories from the dashboard first.
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => { setPreview(null); setError(null); }}
            >
              ← Retry
            </button>
            <button
              className="btn-inject"
              onClick={handleInject}
              disabled={preview.memories_used === 0 || !adapter}
              style={{ flex: 2 }}
            >
              {injected ? '✓ Injected!' : '↑ Inject into Prompt'}
            </button>
          </div>

          {/* Success */}
          {injected && (
            <div className="alert alert-success">
              Context injected! {preview.memories_used} memories prepended to your prompt.
            </div>
          )}
        </>
      )}
    </div>
  );
}
