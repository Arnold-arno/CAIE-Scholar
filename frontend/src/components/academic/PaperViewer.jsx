/**
 * PaperViewer.jsx
 * - Split view: QP + MS side by side simultaneously
 * - "Download" button (hover: "Paper & Mark Scheme") — downloads both as styled HTML page
 * - "View" button (hover: "Full Paper & Mark Scheme") — opens full-screen split view
 * - Keeps app CSS for the download preview
 */
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X, Download, BookOpen, FileText, Loader2,
  AlertCircle, Maximize2, SplitSquareHorizontal, Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function paperViewUrl(paperId, sourceUrl) {
  const p = new URLSearchParams();
  if (sourceUrl) p.set('source_url', sourceUrl);
  return `${API}/api/papers/view/${paperId}?${p}`;
}
function markschemeViewUrl(paperId, sourceUrl) {
  const p = new URLSearchParams();
  if (sourceUrl) p.set('source_url', sourceUrl);
  return `${API}/api/markschemes/view/${paperId}?${p}`;
}

async function fetchPDFBlob(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.blob();
}

// Styled HTML download — preserves app branding
function buildDownloadHTML(paper, qpUrl, msUrl) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>${paper.subject} — ${paper.season_label} ${paper.paper_label}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b}
  .header{background:linear-gradient(135deg,#1d4ed8,#4f46e5);color:#fff;padding:24px 32px;display:flex;align-items:center;gap:16px}
  .header img{width:48px;height:48px;object-fit:contain;border-radius:8px}
  .header h1{font-size:22px;font-weight:700;margin-bottom:4px}
  .header p{font-size:13px;opacity:.8}
  .badges{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
  .badge{background:rgba(255,255,255,.2);padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
  .container{display:grid;grid-template-columns:1fr 1fr;gap:0;height:calc(100vh - 110px)}
  .pane{display:flex;flex-direction:column;border-right:1px solid #e2e8f0}
  .pane:last-child{border-right:none}
  .pane-header{padding:12px 20px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:13px;display:flex;align-items:center;gap:8px;background:#fff}
  .qp-header{color:#1d4ed8;border-left:4px solid #1d4ed8}
  .ms-header{color:#059669;border-left:4px solid #059669}
  .pane iframe{flex:1;width:100%;border:none;height:100%}
  .no-ms{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#f1fdf7;color:#065f46;gap:8px}
  @media print{.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>${paper.subject}</h1>
    <p>CAIE Scholar — Cambridge Past Paper Viewer</p>
    <div class="badges">
      <span class="badge">${paper.subject_code}</span>
      <span class="badge">${paper.season_label}</span>
      <span class="badge">${paper.paper_label}</span>
      ${paper.has_markscheme ? '<span class="badge">✓ Mark Scheme included</span>' : ''}
    </div>
  </div>
</div>
<div class="container">
  <div class="pane">
    <div class="pane-header qp-header">📄 Question Paper</div>
    <iframe src="${qpUrl}" title="Question Paper"></iframe>
  </div>
  <div class="pane">
    <div class="pane-header ms-header">📋 Mark Scheme</div>
    ${paper.has_markscheme && msUrl
      ? `<iframe src="${msUrl}" title="Mark Scheme"></iframe>`
      : `<div class="no-ms"><span style="font-size:32px">📋</span><p>Mark scheme not available</p></div>`
    }
  </div>
</div>
</body></html>`;
}

function PDFFrame({ url, title, height = '74vh' }) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  return (
    <div className="relative w-full" style={{ height }}>
      {loading && !errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg z-10">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
          <p className="text-sm text-gray-400">Loading PDF…</p>
        </div>
      )}
      {errored && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 rounded-lg z-10 border-2 border-red-100">
          <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
          <p className="font-medium text-red-700 text-sm mb-1">Could not load PDF</p>
          <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
            <Maximize2 className="w-3.5 h-3.5 mr-1.5" />Open in new tab
          </Button>
        </div>
      )}
      <iframe src={url} title={title}
        className="w-full h-full rounded-lg border border-gray-200"
        style={{ display: errored ? 'none' : 'block' }}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setErrored(true); }}
      />
    </div>
  );
}

// Tooltip wrapper
function TipButton({ tip, children, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Button {...props}>{children}</Button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
          {tip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default function PaperViewer({ paper, onClose }) {
  const [viewMode,    setViewMode]    = useState('split'); // 'split' | 'qp' | 'ms'
  const [downloading, setDownloading] = useState(false);

  if (!paper) return null;

  const qpUrl = paperViewUrl(paper.id, paper.source_url);
  const msUrl = paper.has_markscheme
    ? markschemeViewUrl(paper.id.replace('_qp','_ms'), paper.markscheme_url)
    : null;

  // Download both as a styled branded HTML file (preserves app CSS)
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html  = buildDownloadHTML(paper, qpUrl, msUrl);
      const blob  = new Blob([html], { type: 'text/html' });
      const url   = URL.createObjectURL(blob);
      const link  = document.createElement('a');
      link.href     = url;
      link.download = `${paper.subject_code}_${paper.season_label}_${paper.paper_label}.html`.replace(/\s+/g,'_');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Downloaded — open the HTML file to view both papers with mark scheme');
    } catch (e) {
      toast.error(`Download failed: ${e.message}`);
    } finally { setDownloading(false); }
  };

  // View full-screen — opens styled HTML page in new tab
  const handleFullView = () => {
    const html = buildDownloadHTML(paper, qpUrl, msUrl);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const srcLabel = {
    local:         '📁 Local',
    papacambridge: '🌐 PapaCambridge',
    gceguide:      '🌐 GCE Guide',
  }[paper.source] || '🌐 Online';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-white">

        {/* Header */}
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 py-3 px-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <CardTitle className="text-base font-bold truncate">{paper.subject}</CardTitle>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <Badge variant="outline" className="text-xs text-blue-700 border-blue-200 bg-blue-50">{paper.subject_code}</Badge>
                <Badge variant="outline" className="text-xs text-purple-700 border-purple-200 bg-purple-50">{paper.season_label}</Badge>
                <Badge variant="outline" className="text-xs text-gray-600 border-gray-200">{paper.paper_label}</Badge>
                {paper.has_markscheme && (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">✓ MS available</Badge>
                )}
                <span className="text-xs text-gray-400 self-center">{srcLabel}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
              {/* Download button */}
              <TipButton
                tip="Paper & Mark Scheme"
                size="sm" variant="outline"
                onClick={handleDownload}
                disabled={downloading}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs gap-1.5"
              >
                {downloading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Download className="w-3.5 h-3.5" />
                }
                Download
              </TipButton>

              {/* View full button */}
              <TipButton
                tip="Full Paper & Mark Scheme"
                size="sm" variant="outline"
                onClick={handleFullView}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-8 text-xs gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />View
              </TipButton>

              {/* Close */}
              {onClose && (
                <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          {/* View mode toggle */}
          <div className="flex gap-1.5 mb-3">
            {[
              { mode: 'split', icon: SplitSquareHorizontal, label: 'Split view' },
              { mode: 'qp',    icon: FileText,              label: 'Question Paper' },
              { mode: 'ms',    icon: BookOpen,              label: 'Mark Scheme' },
            ].map(({ mode, icon: Icon, label }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                disabled={mode === 'ms' && !paper.has_markscheme}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40'
                }`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          {/* Split view */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Question Paper</span>
                </div>
                <PDFFrame url={qpUrl} title="QP" height="68vh" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2 px-1">
                  <BookOpen className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Mark Scheme</span>
                </div>
                {msUrl
                  ? <PDFFrame url={msUrl} title="MS" height="68vh" />
                  : (
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200" style={{height:'68vh'}}>
                      <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-gray-400 text-sm text-center px-4">Mark scheme not available for this paper</p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Single QP */}
          {viewMode === 'qp' && <PDFFrame url={qpUrl} title="Question Paper" />}

          {/* Single MS */}
          {viewMode === 'ms' && msUrl && <PDFFrame url={msUrl} title="Mark Scheme" />}
        </CardContent>
      </Card>
    </motion.div>
  );
}
