/**
 * PaperAnalyser.jsx
 *
 * Lets the user upload a past paper PDF, specify the subject,
 * then sends it to /api/ai/analyse-paper which returns structured
 * questions + model answers as JSON.
 *
 * Placed as a sub-panel inside the Search Questions tab.
 */
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Loader2, AlertCircle, CheckCircle,
  ChevronDown, ChevronUp, BookOpen, Lightbulb, Target,
  Download, RefreshCw, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Encode a File as base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// Single question card
function QuestionCard({ q, idx }) {
  const [open, setOpen] = useState(false);
  const typeColour = {
    structured: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    essay:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    mcq:        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    calculation:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'data-response':'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  };
  return (
    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx * 0.04 }}
      className="border border-gray-200 dark:border-[hsl(222,18%,22%)] rounded-2xl overflow-hidden bg-white dark:bg-[hsl(222,24%,12%)]">

      {/* Header */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-[hsl(222,24%,14%)] transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
          {q.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {q.type && (
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeColour[q.type] || typeColour.structured}`}>
                {q.type}
              </span>
            )}
            {q.marks && (
              <span className="text-[10px] font-bold bg-gray-100 dark:bg-[hsl(222,22%,18%)] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                [{q.marks} mark{q.marks !== 1 ? 's' : ''}]
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-2">
            {q.text}
          </p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1"/> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1"/>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            className="overflow-hidden border-t border-gray-100 dark:border-[hsl(222,18%,18%)]">
            <div className="p-4 space-y-4">

              {/* Sub-parts */}
              {q.sub_parts && q.sub_parts.length > 0 && (
                <div className="space-y-2">
                  {q.sub_parts.map((sp, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 w-8">{sp.label}</span>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed flex-1">{sp.text}</p>
                      {sp.marks && <span className="text-xs text-gray-400 flex-shrink-0">[{sp.marks}m]</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Model answer */}
              {q.model_answer && (
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-xl p-4">
                  <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5"/>Model Answer
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{q.model_answer}</p>
                </div>
              )}

              {/* Mark scheme notes */}
              {q.mark_scheme_notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-xl p-3">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5"/>Examiner Notes
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{q.mark_scheme_notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PaperAnalyser({ subjects = {}, examType = 'IGCSE' }) {
  const [file,      setFile]      = useState(null);
  const [subject,   setSubject]   = useState('');
  const [dragging,  setDragging]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');
  const fileRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error('File too large — max 20 MB'); return; }
    setFile(f);
    setResult(null);
    setError('');
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const analyse = async () => {
    if (!file)    { toast.error('Please upload a PDF first'); return; }
    if (!subject) { toast.error('Please specify the subject'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const pdf_b64 = await fileToBase64(file);
      const res = await fetch(`${BACKEND}/api/ai/analyse-paper`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ pdf_b64, subject, exam_type: examType }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg.slice(0, 200));
      }
      const data = await res.json();
      if (data.parse_error) {
        setError('AI returned unexpected format. Raw response shown below.');
        setResult({ raw: data.raw });
      } else {
        setResult(data);
        toast.success(`Extracted ${data.questions?.length || 0} questions with model answers!`);
      }
    } catch (e) {
      setError(e.message);
      toast.error('Analysis failed');
    } finally { setLoading(false); }
  };

  // Download result as formatted HTML
  const downloadHTML = () => {
    if (!result || !result.questions) return;
    const qs = result.questions.map((q, i) => `
      <div class="question">
        <div class="q-header">
          <span class="q-num">Q${q.number}</span>
          <span class="q-marks">[${q.marks || '?'} marks]</span>
          ${q.type ? `<span class="q-type">${q.type}</span>` : ''}
        </div>
        <p class="q-text">${q.text}</p>
        ${q.sub_parts?.map(sp => `<div class="sub-part"><strong>${sp.label}</strong> ${sp.text} <span class="sub-marks">[${sp.marks}m]</span></div>`).join('') || ''}
        ${q.model_answer ? `<div class="answer"><strong>Model answer:</strong><br>${q.model_answer}</div>` : ''}
        ${q.mark_scheme_notes ? `<div class="notes"><strong>Examiner notes:</strong> ${q.mark_scheme_notes}</div>` : ''}
      </div>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${result.paper_title || subject}</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#1e293b}
h1{font-family:sans-serif;color:#1d4ed8}h2{font-family:sans-serif;color:#334155;margin-top:32px}
.question{margin-bottom:28px;padding:20px;border:1px solid #e2e8f0;border-radius:10px;page-break-inside:avoid}
.q-header{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.q-num{background:#1d4ed8;color:#fff;font-family:sans-serif;font-weight:700;padding:2px 10px;border-radius:99px;font-size:11pt}
.q-marks{color:#6d28d9;font-family:sans-serif;font-size:10pt;font-weight:600}
.q-type{background:#f1f5f9;color:#475569;font-family:sans-serif;font-size:9pt;padding:2px 8px;border-radius:99px}
.q-text{margin:0 0 12px;line-height:1.7}
.sub-part{margin:6px 0 6px 16px;font-size:10.5pt}.sub-marks{color:#64748b}
.answer{background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;margin-top:12px;border-radius:0 8px 8px 0;font-size:10.5pt;white-space:pre-wrap}
.notes{background:#fffbeb;border-left:4px solid #f59e0b;padding:10px 14px;margin-top:8px;border-radius:0 8px 8px 0;font-size:10pt;color:#92400e}
</style></head><body>
<h1>${result.paper_title || subject} — Question Breakdown</h1>
<p><strong>Subject:</strong> ${subject} · <strong>Level:</strong> ${examType} · <strong>Total marks:</strong> ${result.total_marks || '?'}</p>
${result.examiner_notes ? `<p style="background:#eff6ff;padding:12px 16px;border-radius:8px;color:#1e40af"><strong>Examiner overview:</strong> ${result.examiner_notes}</p>` : ''}
<h2>Questions & Model Answers</h2>
${qs}
<p style="margin-top:40px;color:#94a3b8;font-size:9pt;text-align:center">Generated by CAIE Scholar · ${new Date().toLocaleString()}</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${subject.replace(/\s+/g,'_')}_breakdown.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div className="bg-white dark:bg-[hsl(222,24%,12%)] rounded-2xl border border-gray-200 dark:border-[hsl(222,18%,22%)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-[hsl(222,18%,18%)] bg-gradient-to-r from-violet-50 to-purple-50 dark:from-[hsl(260,25%,13%)] dark:to-[hsl(270,20%,14%)]">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-base">
            <Upload className="w-5 h-5 text-violet-600"/>Upload a Paper for AI Analysis
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Upload any Cambridge past paper PDF — the AI extracts all questions and generates model answers with mark scheme notes.
          </p>
        </div>
        <div className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragging ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' :
              file      ? 'border-green-400 bg-green-50 dark:bg-green-900/10' :
                          'border-gray-300 dark:border-[hsl(222,18%,24%)] hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-900/10'
            }`}>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}/>
            {file ? (
              <>
                <FileText className="w-10 h-10 mx-auto text-green-500 mb-2"/>
                <p className="font-bold text-green-700 dark:text-green-400">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2"/>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Drop a PDF here or click to browse</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cambridge past paper PDF · Max 20 MB</p>
              </>
            )}
          </div>

          {/* Subject selector */}
          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">Subject <span className="text-red-400">*</span></label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl bg-white dark:bg-[hsl(222,22%,13%)] text-gray-900 dark:text-gray-100 text-sm focus:border-violet-500 focus:outline-none">
              <option value="">Select the subject of this paper…</option>
              {Object.keys(subjects).sort().map(s => {
                const code = typeof subjects[s] === 'object' ? subjects[s].code : subjects[s];
                return <option key={s} value={s}>{s} — {code}</option>;
              })}
            </select>
          </div>

          <Button onClick={analyse} disabled={!file || !subject || loading}
            className="w-full py-4 text-base font-bold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl gap-2">
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin"/>Analysing paper…</>
              : <><Lightbulb className="w-5 h-5"/>Analyse & Extract Questions</>}
          </Button>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/><span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && !result.raw && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

            {/* Summary bar */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-2xl p-5 mb-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-extrabold text-lg leading-tight">{result.paper_title || subject}</h3>
                  <p className="text-violet-200 text-sm mt-0.5">{examType} · {subject}</p>
                  {result.examiner_notes && (
                    <p className="text-violet-100 text-sm mt-2 max-w-xl leading-relaxed">{result.examiner_notes}</p>
                  )}
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-extrabold">{result.questions?.length || 0}</p>
                    <p className="text-violet-200 text-xs">Questions</p>
                  </div>
                  <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-extrabold">{result.total_marks || '?'}</p>
                    <p className="text-violet-200 text-xs">Total marks</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button size="sm" onClick={downloadHTML}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl gap-1.5 text-xs">
                  <Download className="w-3.5 h-3.5"/>Download breakdown
                </Button>
                <Button size="sm" onClick={() => { setResult(null); setFile(null); }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl gap-1.5 text-xs">
                  <RefreshCw className="w-3.5 h-3.5"/>Analyse another
                </Button>
              </div>
            </div>

            {/* Question list */}
            <div className="space-y-3">
              {(result.questions || []).map((q, i) => (
                <QuestionCard key={i} q={q} idx={i}/>
              ))}
            </div>
          </motion.div>
        )}

        {/* Raw fallback */}
        {result?.raw && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="bg-gray-50 dark:bg-[hsl(222,24%,12%)] border border-gray-200 dark:border-[hsl(222,18%,22%)] rounded-2xl p-5">
            <p className="font-bold text-gray-700 dark:text-gray-300 mb-3">Raw AI response (JSON parse failed):</p>
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap overflow-auto max-h-64">{result.raw}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
