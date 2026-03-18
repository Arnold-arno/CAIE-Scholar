/**
 * AINotesGenerator.jsx
 *
 * Improvements implemented:
 *   1. Regenerate diagram — per-section retry button (RefreshCw icon)
 *   2. Topic history     — last 20 sessions, sidebar panel, click to restore
 *   3. Flashcard mode    — hides model answers until clicked, keyboard nav (←→)
 *   4. No annotation on view (PDF is read-only; no annotation tooling added)
 *
 * Diagram placement:
 *   - Each section that requests one gets its own SVG, placed right after prose
 *   - Same position maintained inside the downloaded PDF
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sparkles, Loader2, Download, BookOpen, ExternalLink,
  AlertCircle, CheckCircle, ImageIcon, RefreshCw,
  History, Trash2, ChevronLeft, ChevronRight, X,
  GraduationCap, Clock, ZapOff, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SearchableSubjectSelect from './SearchableSubjectSelect';
import { useAppContext } from '@/context/AppContext';

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-6';

// ── External study resources per exam level ───────────────────────────────────
const STUDY_LINKS = {
  IGCSE: [
    { name: 'Save My Exams',         url: 'https://www.savemyexams.com/igcse/',    desc: 'Revision notes & past papers' },
    { name: 'Z-Notes',               url: 'https://znotes.org/caie/igcse/',        desc: 'Free condensed notes' },
    { name: 'Physics & Maths Tutor', url: 'https://www.physicsandmathstutor.com/', desc: 'Past papers + notes' },
    { name: 'GCE Guide',             url: 'https://www.gceguide.com/',             desc: 'Past papers archive' },
  ],
  AS_LEVEL: [
    { name: 'Save My Exams A-Level', url: 'https://www.savemyexams.com/a-level/', desc: 'Detailed A-Level notes' },
    { name: 'Revisely',              url: 'https://www.revisely.co.uk/',           desc: 'A-Level resources' },
    { name: 'Seneca Learning',       url: 'https://senecalearning.com/',           desc: 'Interactive learning' },
  ],
  O_LEVEL: [
    { name: 'GCE Guide O-Level', url: 'https://www.gceguide.com/', desc: 'Past papers archive' },
    { name: 'TeachifyMe',        url: 'https://teachifyme.com/',   desc: 'Video tutorials' },
  ],
};

// ── Claude API call ───────────────────────────────────────────────────────────
async function callClaude(userContent) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 1000,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API ${res.status}: ${body.slice(0, 160)}`);
  }
  const data = await res.json();
  return (data.content || []).map(c => c.text || '').join('').trim();
}

// ── Prompts ───────────────────────────────────────────────────────────────────
function buildNotesPrompt(subject, topic, examType) {
  return `You are an experienced ${examType} teacher writing personal study notes for a student who just learned "${topic}" in ${subject}.

Write notes the way a warm, knowledgeable human tutor would — flowing prose, second-person, conversational. No robotic bullet lists. Use phrases like "Think of it this way…", "Here is the key insight…", "What trips most students up is…".

Return ONLY valid JSON (no markdown fences, no explanation outside the JSON):

{
  "hook": "One vivid sentence capturing why this topic matters in real life or in Cambridge exams",
  "overview": "3–4 sentence paragraph — the big idea, why it exists, what students usually find confusing. Sound like a teacher talking, not a textbook.",
  "sections": [
    {
      "title": "Section title (e.g. 'The core idea', 'How it actually works', 'The maths behind it')",
      "prose": "4–6 sentences of flowing human explanation. Embed any formula inline using plain notation.",
      "worked_example": "One step-by-step Cambridge-style worked example. Number each step on its own line.",
      "common_error": "One specific mistake students make and exactly why it costs marks",
      "needs_diagram": true,
      "diagram_description": "One precise sentence describing what to draw (e.g. 'A labelled cross-section of a leaf showing palisade cells, spongy mesophyll, stomata and guard cells'). Set to null if needs_diagram is false."
    }
  ],
  "exam_strategy": "2–3 sentences of honest exam advice — what examiners reward, typical marks, how to structure answers for full credit",
  "memory_hook": "One vivid analogy, mnemonic, or mental image for the single most important concept",
  "practice_questions": [
    {
      "question": "A Cambridge-style exam question",
      "marks": 4,
      "model_answer": "Concise mark-scheme style answer showing key points an examiner would award marks for"
    }
  ]
}

Generate 3 sections (set needs_diagram true for 1–2 where a visual genuinely helps). Generate 3 practice questions. Be specific to ${examType} ${subject}.`;
}

function buildDiagramPrompt(subject, topic, description) {
  return `Create a clean educational SVG diagram for Cambridge ${subject} students studying "${topic}".

The diagram must show: ${description}

Return ONLY the raw SVG element — start with <svg, end with </svg>. No markdown, no JSON, no text outside the SVG.

Requirements:
- viewBox="0 0 600 380" width="600" height="380"
- First child: <rect width="600" height="380" fill="#f8fafc" rx="8"/>
- <defs> with arrow marker: <defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1l8 4-8 4" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
- Title: <text x="300" y="28" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="bold" fill="#1e293b">Short title here</text>
- All text: font-family="system-ui,sans-serif" — never omit this on any text element
- Box fills: use only (#dbeafe #dcfce7 #fef3c7 #ede9fe #fee2e2 #f0fdf4 #fff7ed)
- Box text: font-size="12" fill="#1e293b" — always dark
- Arrows: stroke="#64748b" stroke-width="1.5" fill="none" marker-end="url(#arr)"
- Maximum 12 labeled elements — clarity over completeness
- All content within x:20–580, y:20–360 — nothing touches edges`;
}

// ── PDF document builder ──────────────────────────────────────────────────────
function buildPDF(notes, subject, topic, examType, sectionDiagrams) {
  const date = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });

  const sectionsHTML = (notes.sections || []).map((s, i) => {
    const diag = sectionDiagrams[i]
      ? `<div class="diag-wrap">
           <div class="diag-label">Figure ${i+1} — ${s.title}</div>
           ${sectionDiagrams[i]}
         </div>` : '';
    return `
      <div class="section">
        <h2>${i+1}. ${s.title}</h2>
        <p>${s.prose}</p>
        ${diag}
        ${s.worked_example ? `<div class="worked"><div class="worked-lbl">Worked Example</div><pre>${s.worked_example.trim()}</pre></div>` : ''}
        ${s.common_error   ? `<div class="caution"><span class="warn-icon">⚠</span><div><strong>Common mistake:</strong> ${s.common_error}</div></div>` : ''}
      </div>`;
  }).join('');

  const qHTML = (notes.practice_questions || []).map((q, i) => `
    <div class="q-card">
      <div class="q-row"><span class="q-badge">Q${i+1}</span><span class="q-marks">[${q.marks} mark${q.marks!==1?'s':''}]</span></div>
      <p class="q-text">${q.question}</p>
      <div class="ans"><div class="ans-lbl">Model answer</div><p>${q.model_answer}</p></div>
    </div>`).join('');

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8">
<title>${subject} — ${topic} | CAIE Scholar</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
@page{margin:2.2cm 2cm;size:A4}
body{font-family:Georgia,'Times New Roman',serif;font-size:11.5pt;line-height:1.75;color:#1e293b;background:#fff}
.cover{background:linear-gradient(135deg,#1d4ed8 0%,#4338ca 60%,#7c3aed 100%);color:#fff;padding:32px 36px 28px;border-radius:0 0 16px 16px;margin-bottom:32px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.cover-brand{font-family:system-ui,sans-serif;font-size:10.5pt;opacity:.7;margin-bottom:8px;letter-spacing:.06em}
.cover h1{font-family:system-ui,sans-serif;font-size:22pt;font-weight:700;line-height:1.2;margin-bottom:6px}
.cover p{opacity:.82;font-family:system-ui,sans-serif;font-size:11pt}
.badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.badge{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);padding:3px 12px;border-radius:99px;font-family:system-ui,sans-serif;font-size:9.5pt;font-weight:600}
.hook{font-size:12.5pt;color:#1d4ed8;font-style:italic;border-left:4px solid #1d4ed8;padding:10px 16px;background:#eff6ff;border-radius:0 10px 10px 0;margin-bottom:22px}
.overview{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 22px;margin-bottom:28px}
.section{margin-bottom:30px;page-break-inside:avoid}
.section h2{font-family:system-ui,sans-serif;font-size:13pt;font-weight:600;color:#1d4ed8;border-bottom:2px solid #dbeafe;padding-bottom:6px;margin-bottom:12px}
.section p{margin-bottom:10px}
.diag-wrap{text-align:center;margin:18px 0 20px;border:1.5px solid #e2e8f0;border-radius:10px;padding:14px 10px 10px;background:#f8fafc;page-break-inside:avoid}
.diag-label{font-family:system-ui,sans-serif;font-size:9.5pt;font-weight:600;color:#64748b;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em}
.diag-wrap svg{max-width:100%;height:auto;display:block;margin:0 auto}
.worked{background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 10px 10px 0;padding:14px 18px;margin:14px 0}
.worked-lbl{font-family:system-ui,sans-serif;font-size:9pt;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px}
.worked pre{font-family:'Courier New',monospace;font-size:10pt;white-space:pre-wrap;color:#166534}
.caution{display:flex;gap:10px;align-items:flex-start;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 10px 10px 0;padding:10px 16px;margin:10px 0;font-size:10.5pt}
.warn-icon{font-size:14pt;line-height:1.4;flex-shrink:0}
.strategy{background:#faf5ff;border:1.5px solid #d8b4fe;border-radius:10px;padding:18px 22px;margin:24px 0}
.strategy h2{font-family:system-ui,sans-serif;font-size:12pt;color:#7c3aed;margin-bottom:8px}
.memory{background:#fefce8;border:2px solid #fde68a;border-radius:10px;padding:16px 20px;margin:20px 0}
.memory h2{font-family:system-ui,sans-serif;font-size:11.5pt;color:#92400e;margin-bottom:8px}
.pq-title{font-family:system-ui,sans-serif;font-size:14pt;font-weight:600;color:#1e293b;margin:28px 0 16px;border-bottom:2px solid #e2e8f0;padding-bottom:8px}
.q-card{border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:14px;page-break-inside:avoid}
.q-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.q-badge{font-family:system-ui,sans-serif;font-size:10pt;font-weight:700;background:#6d28d9;color:#fff;padding:2px 10px;border-radius:99px}
.q-marks{font-family:system-ui,sans-serif;font-size:9.5pt;color:#6d28d9;font-weight:600}
.q-text{margin-bottom:10px}
.ans{background:#f8fafc;border-radius:8px;padding:12px 16px;border:1px solid #e2e8f0}
.ans-lbl{font-family:system-ui,sans-serif;font-size:9pt;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.ans p{font-size:10.5pt;color:#475569}
.footer{margin-top:36px;padding-top:14px;border-top:1px solid #e2e8f0;text-align:center;font-family:system-ui,sans-serif;font-size:9pt;color:#94a3b8}
.footer strong{color:#3b82f6}
</style></head><body>
<div class="cover">
  <div class="cover-brand">CAIE Scholar · Cambridge Examination Companion</div>
  <h1>${subject}</h1>
  <p>Study Notes: ${topic}</p>
  <div class="badges"><span class="badge">${examType}</span><span class="badge">${topic}</span><span class="badge">${date}</span></div>
</div>
${notes.hook     ? `<p class="hook">${notes.hook}</p>` : ''}
${notes.overview ? `<div class="overview"><p>${notes.overview}</p></div>` : ''}
${sectionsHTML}
${notes.exam_strategy ? `<div class="strategy"><h2>🎯 Exam Strategy</h2><p>${notes.exam_strategy}</p></div>` : ''}
${notes.memory_hook   ? `<div class="memory"><h2>💡 Memory Hook</h2><p>${notes.memory_hook}</p></div>` : ''}
${qHTML ? `<div class="pq-title">Practice Questions</div>${qHTML}` : ''}
<div class="footer">Generated by <strong>CAIE Scholar</strong> · ${new Date().toLocaleString()}</div>
</body></html>`;
}

// ── Flashcard component ───────────────────────────────────────────────────────
function FlashcardMode({ questions, onClose }) {
  const [idx,     setIdx]     = useState(0);
  const [flipped, setFlipped] = useState(false);
  const total = questions.length;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (!flipped) { setFlipped(true); return; }
        if (idx < total - 1) { setIdx(i => i + 1); setFlipped(false); }
      }
      if (e.key === 'ArrowLeft') {
        if (idx > 0) { setIdx(i => i - 1); setFlipped(false); }
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, idx, total, onClose]);

  const q = questions[idx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Flashcard Mode</span>
            <span className="text-white/50 text-xs">— use ← → or Space to navigate</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center mb-5">
          {questions.map((_, i) => (
            <div key={i}
              onClick={() => { setIdx(i); setFlipped(false); }}
              className={`h-1.5 rounded-full cursor-pointer transition-all ${
                i === idx ? 'w-6 bg-purple-400' : i < idx ? 'w-2 bg-green-400' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={`${idx}-${flipped}`}
          initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={() => setFlipped(f => !f)}
          className="cursor-pointer"
        >
          <div className={`rounded-2xl p-8 min-h-[280px] flex flex-col justify-between shadow-2xl transition-colors ${
            flipped
              ? 'bg-gradient-to-br from-green-800 to-emerald-900 border-2 border-green-500/40'
              : 'bg-gradient-to-br from-indigo-800 to-purple-900 border-2 border-indigo-500/40'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  flipped ? 'bg-green-500/20 text-green-300' : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {flipped ? 'Model Answer' : `Question ${idx + 1} of ${total}`}
                </span>
                <span className="text-white/30 text-xs">[{q.marks} mark{q.marks !== 1 ? 's' : ''}]</span>
              </div>
              <p className={`text-lg leading-relaxed font-medium ${flipped ? 'text-green-100' : 'text-white'}`}>
                {flipped ? q.model_answer : q.question}
              </p>
            </div>
            <p className={`text-xs mt-4 ${flipped ? 'text-green-400/60' : 'text-indigo-300/60'}`}>
              {flipped ? '← Previous card · → Next card' : 'Click or press Space to reveal answer'}
            </p>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" onClick={() => { if (idx > 0) { setIdx(i => i - 1); setFlipped(false); } }}
            disabled={idx === 0}
            className="text-white/60 hover:text-white disabled:opacity-20 gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <span className="text-white/40 text-sm">{idx + 1} / {total}</span>
          <Button variant="ghost"
            onClick={() => {
              if (!flipped) { setFlipped(true); return; }
              if (idx < total - 1) { setIdx(i => i + 1); setFlipped(false); }
            }}
            className="text-white/60 hover:text-white gap-1.5">
            {!flipped ? 'Show answer' : idx < total - 1 ? 'Next' : 'Done'} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Topic history sidebar ─────────────────────────────────────────────────────
function HistorySidebar({ examType, onRestore, onClose }) {
  const { notesHistory, deleteNotesSession, clearNotesHistory } = useAppContext();
  const filtered = notesHistory.filter(h => h.examType === examType);

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="fixed inset-y-0 right-0 z-40 w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b bg-purple-50">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-600" />
          <span className="font-semibold text-gray-800">Notes History</span>
          <span className="text-xs text-gray-400">{examType}</span>
        </div>
        <div className="flex items-center gap-1">
          {filtered.length > 0 && (
            <button onClick={clearNotesHistory}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors">
              Clear all
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No saved notes yet</p>
            <p className="text-xs mt-1 opacity-70">Generate notes to save them here</p>
          </div>
        ) : (
          filtered.map(h => (
            <div key={h.id}
              className="group flex items-start gap-2 p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
              onClick={() => onRestore(h)}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{h.subject}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{h.topic}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3 h-3 text-gray-300" />
                  <span className="text-[10px] text-gray-400">
                    {new Date(h.savedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                  </span>
                  {h.diagrams?.filter(Boolean).length > 0 && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded-full ml-1">
                      {h.diagrams.filter(Boolean).length} diagram{h.diagrams.filter(Boolean).length!==1?'s':''}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteNotesSession(h.id); }}
                className="p-1 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-0.5"
                title="Delete this session">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AINotesGenerator({ subjects = {}, examType = 'IGCSE' }) {
  const { saveNotesSession } = useAppContext();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [topic,           setTopic]           = useState('');
  const [generating,      setGenerating]      = useState(false);
  const [regenIdx,        setRegenIdx]        = useState(-1);  // index of diagram being regenerated
  const [genStep,         setGenStep]         = useState('');
  const [genPct,          setGenPct]          = useState(0);
  const [notes,           setNotes]           = useState(null);
  const [sectionDiagrams, setSectionDiagrams] = useState([]);
  const [error,           setError]           = useState('');
  const [flashcardOpen,   setFlashcardOpen]   = useState(false);
  const [historyOpen,     setHistoryOpen]     = useState(false);

  const links = STUDY_LINKS[examType] || STUDY_LINKS.IGCSE;

  // ── Generate all notes + diagrams ─────────────────────────────────────────
  const generate = async () => {
    if (!selectedSubject || !topic.trim()) { toast.error('Select a subject and enter a topic'); return; }
    setGenerating(true); setError(''); setNotes(null); setSectionDiagrams([]); setGenPct(5);
    try {
      setGenStep('Writing your study notes…');
      const rawNotes  = await callClaude(buildNotesPrompt(selectedSubject, topic, examType));
      const cleaned   = rawNotes.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim();
      let parsed;
      try { parsed = JSON.parse(cleaned); }
      catch (e) { throw new Error(`Notes JSON parse failed: ${e.message}. Got: ${cleaned.slice(0,100)}`); }
      setNotes(parsed);
      setGenPct(45);

      // Diagrams
      const sections    = parsed.sections || [];
      const needDiagram = sections.map((s,i) => ({s,i})).filter(({s}) => s.needs_diagram && s.diagram_description);
      const diagrams    = Array(sections.length).fill('');
      const perDiag     = needDiagram.length > 0 ? Math.floor(50 / needDiagram.length) : 0;

      for (let k = 0; k < needDiagram.length; k++) {
        const { s, i } = needDiagram[k];
        setGenStep(`Creating diagram ${k+1} of ${needDiagram.length}: ${s.title}…`);
        try {
          const raw   = await callClaude(buildDiagramPrompt(selectedSubject, topic, s.diagram_description));
          const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
          if (match) diagrams[i] = match[0];
        } catch (e) { console.warn(`Diagram ${i} skipped:`, e.message); }
        setGenPct(45 + perDiag * (k + 1));
      }

      setSectionDiagrams(diagrams);
      setGenPct(100);

      // Save to history
      saveNotesSession({
        subject: selectedSubject, topic, examType,
        notes: parsed, diagrams,
      });

      toast.success('Notes and diagrams ready!');
    } catch (err) {
      setError(err.message);
      toast.error('Generation failed');
    } finally {
      setGenerating(false); setGenStep(''); setGenPct(0);
    }
  };

  // ── Regenerate a single diagram ───────────────────────────────────────────
  const regenerateDiagram = useCallback(async (idx) => {
    const section = notes?.sections?.[idx];
    if (!section?.diagram_description) return;
    setRegenIdx(idx);
    try {
      toast.info(`Regenerating diagram for "${section.title}"…`);
      const raw   = await callClaude(buildDiagramPrompt(selectedSubject, topic, section.diagram_description));
      const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
      if (match) {
        setSectionDiagrams(prev => {
          const next = [...prev];
          next[idx]  = match[0];
          // Update the persisted session too
          saveNotesSession({ subject: selectedSubject, topic, examType, notes, diagrams: next });
          return next;
        });
        toast.success('Diagram updated!');
      } else {
        toast.error('Could not extract SVG from response');
      }
    } catch (e) {
      toast.error(`Regenerate failed: ${e.message}`);
    } finally {
      setRegenIdx(-1);
    }
  }, [notes, selectedSubject, topic, examType, saveNotesSession]);

  // ── Restore from history ──────────────────────────────────────────────────
  const restoreSession = useCallback((session) => {
    setSelectedSubject(session.subject);
    setTopic(session.topic);
    setNotes(session.notes);
    setSectionDiagrams(session.diagrams || []);
    setError('');
    setHistoryOpen(false);
    toast.success(`Restored: ${session.subject} — ${session.topic}`);
  }, []);

  // ── Download PDF ──────────────────────────────────────────────────────────
  const downloadPDF = () => {
    if (!notes) return;
    const html = buildPDF(notes, selectedSubject, topic, examType, sectionDiagrams);
    const win  = window.open('', '_blank');
    if (!win) { toast.error('Pop-up blocked — allow pop-ups and try again'); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 700);
  };

  const diagramCount = sectionDiagrams.filter(Boolean).length;
  const hasQuestions = (notes?.practice_questions || []).length > 0;

  return (
    <div className="space-y-6">

      {/* ── Input card ─────────────────────────────────────────────────────── */}
      <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />AI Study Notes
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(true)}
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 gap-1.5 text-xs">
              <History className="w-3.5 h-3.5" />Topic history
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Human-like prose · Inline diagrams · PDF download · Flashcard self-test
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <SearchableSubjectSelect
            subjects={subjects} selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject} label="Subject" stepNumber="1" />

          <div>
            <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Topic or chapter
            </Label>
            <Textarea
              placeholder="e.g. Quadratic equations, Photosynthesis, Newton's Laws, Supply and Demand…"
              value={topic} onChange={e => setTopic(e.target.value)}
              className="min-h-[80px] border-2 border-gray-200 rounded-xl resize-none" />
          </div>

          <Button onClick={generate} disabled={!selectedSubject || !topic.trim() || generating}
            className="w-full py-5 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white">
            {generating
              ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{genStep || 'Generating…'}</>
              : <><Sparkles className="w-5 h-5 mr-2" />Generate Study Notes</>}
          </Button>

          {/* Progress bar */}
          {generating && genPct > 0 && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${genPct}%` }} transition={{ duration: 0.4 }} />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Generated notes ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {notes && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-none shadow-xl bg-white/90">
              <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span className="truncate max-w-xs">{selectedSubject} — {topic}</span>
                    {diagramCount > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                        <ImageIcon className="w-3 h-3" />{diagramCount} diagram{diagramCount!==1?'s':''}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasQuestions && (
                      <Button size="sm" variant="outline" onClick={() => setFlashcardOpen(true)}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 gap-1.5 text-xs">
                        <Zap className="w-3.5 h-3.5" />Flashcards
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={downloadPDF}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 gap-1.5 text-xs">
                      <Download className="w-4 h-4" />Download PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">

                {/* Hook */}
                {notes.hook && (
                  <p className="text-base text-blue-700 italic border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-xl leading-relaxed">
                    {notes.hook}
                  </p>
                )}

                {/* Overview */}
                {notes.overview && (
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <p className="text-gray-700 leading-relaxed">{notes.overview}</p>
                  </div>
                )}

                {/* Sections */}
                {(notes.sections || []).map((s, i) => (
                  <div key={i} className="border-2 border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-3 flex items-center justify-between">
                      <h3 className="font-bold text-white">{i+1}. {s.title}</h3>
                      <div className="flex items-center gap-2">
                        {sectionDiagrams[i] && (
                          <span className="text-xs bg-white/20 text-white/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />diagram
                          </span>
                        )}
                        {/* Regenerate diagram button */}
                        {s.needs_diagram && s.diagram_description && (
                          <button
                            onClick={() => regenerateDiagram(i)}
                            disabled={regenIdx === i || generating}
                            title="Regenerate diagram"
                            className="p-1 text-white/60 hover:text-white disabled:opacity-30 transition-colors rounded">
                            <RefreshCw className={`w-3.5 h-3.5 ${regenIdx === i ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Prose */}
                      <p className="text-gray-700 leading-relaxed">{s.prose}</p>

                      {/* Inline diagram — right after prose */}
                      {sectionDiagrams[i] && (
                        <div className="border-2 border-blue-100 rounded-xl bg-gradient-to-b from-blue-50/40 to-transparent overflow-hidden">
                          <div className="flex items-center justify-between px-4 pt-3 pb-1">
                            <div className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                                Figure {i+1}: {s.title}
                              </span>
                            </div>
                            <button onClick={() => regenerateDiagram(i)}
                              disabled={regenIdx === i || generating}
                              title="Regenerate this diagram"
                              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-600 disabled:opacity-30 transition-colors px-2 py-0.5 rounded hover:bg-blue-100">
                              <RefreshCw className={`w-3 h-3 ${regenIdx === i ? 'animate-spin' : ''}`} />
                              {regenIdx === i ? 'Generating…' : 'Regenerate'}
                            </button>
                          </div>
                          <div className="px-4 pb-4 overflow-auto"
                            dangerouslySetInnerHTML={{ __html: sectionDiagrams[i] }} />
                        </div>
                      )}

                      {/* Worked example */}
                      {s.worked_example && (
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4">
                          <p className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide">Worked Example</p>
                          <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">{s.worked_example}</pre>
                        </div>
                      )}

                      {/* Common error */}
                      {s.common_error && (
                        <div className="flex items-start gap-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-3.5">
                          <span className="text-lg leading-tight flex-shrink-0">⚠️</span>
                          <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Common Mistake</p>
                            <p className="text-sm text-gray-700">{s.common_error}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Exam strategy */}
                {notes.exam_strategy && (
                  <div className="bg-violet-50 border-2 border-violet-200 rounded-xl p-5">
                    <h3 className="font-semibold text-violet-800 mb-2">🎯 Exam Strategy</h3>
                    <p className="text-gray-700 leading-relaxed">{notes.exam_strategy}</p>
                  </div>
                )}

                {/* Memory hook */}
                {notes.memory_hook && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5">
                    <h3 className="font-semibold text-yellow-800 mb-2">💡 Memory Hook</h3>
                    <p className="text-gray-700 leading-relaxed">{notes.memory_hook}</p>
                  </div>
                )}

                {/* Practice questions */}
                {hasQuestions && (
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-100">
                      <h3 className="font-bold text-gray-800">✅ Practice Questions</h3>
                      <Button size="sm" variant="ghost" onClick={() => setFlashcardOpen(true)}
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 gap-1.5 text-xs">
                        <Zap className="w-3.5 h-3.5" />Open as flashcards
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {notes.practice_questions.map((q, i) => (
                        <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold bg-purple-600 text-white px-2.5 py-0.5 rounded-full">Q{i+1}</span>
                            <span className="text-xs text-purple-600 font-semibold">[{q.marks} mark{q.marks!==1?'s':''}]</span>
                          </div>
                          <p className="text-sm text-gray-800 mb-3 leading-relaxed">{q.question}</p>
                          <details className="cursor-pointer group">
                            <summary className="text-xs font-semibold text-purple-600 hover:text-purple-800 list-none flex items-center gap-1.5 select-none">
                              <CheckCircle className="w-3.5 h-3.5" />Show model answer
                            </summary>
                            <div className="mt-2 bg-white rounded-lg p-3.5 border border-purple-100">
                              <p className="text-xs text-gray-700 leading-relaxed">{q.model_answer}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Study resources ─────────────────────────────────────────────────── */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="w-5 h-5 text-blue-600" />Extra Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid sm:grid-cols-2 gap-3">
          {links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-3.5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group">
              <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600">{l.name}</p>
                <p className="text-xs text-gray-400">{l.desc}</p>
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      {/* ── Flashcard overlay ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {flashcardOpen && notes?.practice_questions?.length > 0 && (
          <FlashcardMode questions={notes.practice_questions} onClose={() => setFlashcardOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── History sidebar overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
              onClick={() => setHistoryOpen(false)} />
            <HistorySidebar examType={examType} onRestore={restoreSession} onClose={() => setHistoryOpen(false)} />
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
