/**
 * usePaperSearch.js — React hook + helpers for the CAIE Scholar backend.
 * Place in: frontend/src/hooks/usePaperSearch.js
 */

import { useState, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Raw fetch helpers ─────────────────────────────────────────────────────────

export async function searchPapers({ level, subject, topic, year, season, paper }) {
  const p = new URLSearchParams({ level, subject });
  if (topic)  p.set('topic', topic);
  if (year)   p.set('year', year);
  if (season) p.set('season', season);
  if (paper)  p.set('paper', paper);
  const r = await fetch(`${API}/api/search?${p}`);
  if (!r.ok) throw new Error(`Search failed: ${r.status}`);
  return r.json();
}

export function paperViewUrl(paperId, sourceUrl) {
  const p = new URLSearchParams();
  if (sourceUrl) p.set('source_url', sourceUrl);
  return `${API}/api/papers/view/${paperId}?${p}`;
}

export function markschemeViewUrl(paperId, sourceUrl) {
  const p = new URLSearchParams();
  if (sourceUrl) p.set('source_url', sourceUrl);
  return `${API}/api/markschemes/view/${paperId}?${p}`;
}

export async function downloadPaper(paperId, sourceUrl) {
  const p = new URLSearchParams();
  if (sourceUrl) p.set('source_url', sourceUrl);
  const r = await fetch(`${API}/api/papers/download/${paperId}?${p}`);
  if (!r.ok) throw new Error(`Download failed: ${r.status}`);
  const blob = await r.blob();
  const cd = r.headers.get('Content-Disposition') || '';
  const match = cd.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `${paperId}.pdf`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export async function savePaper(paperId, sourceUrl, paperType = 'qp') {
  const r = await fetch(`${API}/api/downloads/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paper_id: paperId, source_url: sourceUrl, paper_type: paperType }),
  });
  if (!r.ok) throw new Error(`Save failed: ${r.status}`);
  return r.json();
}

// ── React hook ────────────────────────────────────────────────────────────────

export function usePaperSearch() {
  const [results,    setResults]    = useState([]);
  const [isSearching, setSearching] = useState(false);
  const [error,      setError]      = useState(null);
  const [meta,       setMeta]       = useState(null);

  const search = useCallback(async (params) => {
    setSearching(true);
    setError(null);
    try {
      const data = await searchPapers(params);
      setResults(data.results || []);
      setMeta({ total: data.total, sources: data.sources_checked, cached: data.cached });
      return data;
    } catch (err) {
      setError(err.message);
      setResults([]);
      return null;
    } finally {
      setSearching(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setMeta(null);
  }, []);

  return { results, isSearching, error, meta, search, reset };
}

// ── Viewer state hook ─────────────────────────────────────────────────────────

export function usePaperViewer() {
  const [state, setState] = useState({ isOpen: false, paper: null, mode: 'qp' });

  const openPaper       = useCallback((paper) => setState({ isOpen: true, paper, mode: 'qp' }),  []);
  const openMarkscheme  = useCallback((paper) => setState({ isOpen: true, paper, mode: 'ms' }),  []);
  const close           = useCallback(() => setState(s => ({ ...s, isOpen: false })),             []);
  const toggleMode      = useCallback(() => setState(s => ({ ...s, mode: s.mode === 'qp' ? 'ms' : 'qp' })), []);

  const viewUrl = state.isOpen && state.paper
    ? state.mode === 'qp'
      ? paperViewUrl(state.paper.id, state.paper.source_url)
      : markschemeViewUrl(state.paper.id, state.paper.markscheme_url)
    : null;

  return { ...state, viewUrl, openPaper, openMarkscheme, close, toggleMode };
}
