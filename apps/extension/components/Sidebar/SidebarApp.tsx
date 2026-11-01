// SidebarApp — Root sidebar component
// Header, project selector, tab bar, content area, footer
// Design: docs/04-UI-UX-DESIGN-BRIEF.md Section 6 + docs/03-APP-FLOW.md Section 10.2

import React, { useEffect, useState, useCallback } from 'react';
import { InjectTab } from './InjectTab';
import { CaptureTab } from './CaptureTab';
import { MemoryTab } from './MemoryTab';
import { getAdapter, getCurrentPlatform } from '../../lib/adapters/registry';
import type { PlatformAdapter } from '../../lib/adapters/base';
import { apiFetch } from '../../api';
import './sidebar.css';

type Tab = 'inject' | 'capture' | 'memory';

interface Project {
  id: string;
  name: string;
}

interface SidebarAppProps {
  onClose: () => void;
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'inject', label: 'Inject', emoji: '↑' },
  { id: 'capture', label: 'Capture', emoji: '💬' },
  { id: 'memory', label: 'Memories', emoji: '🧠' },
];

export function SidebarApp({ onClose }: SidebarAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('inject');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [adapter, setAdapter] = useState<PlatformAdapter | null>(null);
  const [platform, setPlatform] = useState<string>('chatgpt');

  // Initialize adapter
  useEffect(() => {
    const a = getAdapter();
    setAdapter(a);
    const p = getCurrentPlatform();
    if (p) setPlatform(p);
  }, []);

  // Load projects from API
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/projects');
        const list: Project[] = Array.isArray(data) ? data : data.projects ?? [];
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      } catch {
        // Not logged in or API not reachable — that's okay
      } finally {
        setLoadingProjects(false);
      }
    };
    load();
  }, []);

  return (
    <div className="memoryos-sidebar open">
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🧠</div>
          <span>MemoryOS</span>
        </div>
        <button
          className="sidebar-close"
          onClick={onClose}
          title="Close sidebar"
          aria-label="Close MemoryOS sidebar"
        >
          ✕
        </button>
      </div>

      {/* ── Project Selector ── */}
      <div className="project-selector">
        <select
          className="project-select"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          aria-label="Active project"
        >
          {loadingProjects ? (
            <option>Loading projects...</option>
          ) : projects.length === 0 ? (
            <option value="">No projects — create one in Dashboard</option>
          ) : (
            <>
              <option value="">All projects (no filter)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </>
          )}
        </select>
      </div>

      {/* ── Tab Bar ── */}
      <div className="sidebar-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`sidebar-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="sidebar-content" role="tabpanel">
        {activeTab === 'inject' && (
          <InjectTab
            adapter={adapter}
            projectId={selectedProjectId || null}
            platform={platform}
          />
        )}
        {activeTab === 'capture' && <CaptureTab />}
        {activeTab === 'memory' && <MemoryTab />}
      </div>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sync-status">
          <div className="sync-dot" />
          <span>MemoryOS</span>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Open Dashboard ↗
        </a>
      </div>
    </div>
  );
}
