/**
 * QuestionSearch.jsx - full paper search with history, favourites, re-search
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Search, Download, Eye, Loader2, FileText, Star,
  Calendar, Layers, CheckCircle, AlertCircle,
  Filter, ChevronDown, ChevronUp, Clock, History, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SearchableSubjectSelect from './SearchableSubjectSelect';
import PaperViewer from './PaperViewer';
import { usePaperSearch, downloadPaper } from '@/hooks/usePaperSearch';
import { useAppContext } from '@/context/AppContext';

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => 2024 - i);
const SEASONS = [
  { value: 'm_j', label: 'May / June' },
  { value: 'o_n', label: 'Oct / Nov' },
  { value: 'f_m', label: 'Feb / March' },
];
const SOURCE_STYLE = {
  local:         'bg-green-50 text-green-800 border-green-200',
  papacambridge: 'bg-blue-50  text-blue-800  border-blue-200',
  gceguide:      'bg-purple-50 text-purple-800 border-purple-200',
};

export default function QuestionSearch({
  examType = 'IGCSE', subjects = {},
  initialSubject = '', initialTopic = '',
  accentFrom = 'from-blue-700', accentTo = 'to-indigo-700',
}) {
  const [subject,     setSubject]     = useState(initialSubject);
  const [topic,       setTopic]       = useState(initialTopic);
  const [year,        setYear]        = useState('');
  const [season,      setSeason]      = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected,    setSelected]    = useState(null);

  const { results, isSearching, error, search } = usePaperSearch();
  const { addToHistory, history, toggleFavourite, isFavourite } = useAppContext();
  const myHistory = (history[examType] || []).slice(0, 8);

  useEffect(() => {
    const handler = ({ detail }) => {
      if (detail.subject) setSubject(detail.subject);
      if (detail.topic !== undefined) setTopic(detail.topic || '');
      if (detail.autoSearch) setTimeout(() => runSearch(detail.subject, detail.topic), 80);
    };
    window.addEventListener('searchAgain', handler);
    return () => window.removeEventListener('searchAgain', handler);
  }, []);

  useEffect(() => { if (initialSubject) setSubject(initialSubject); }, [initialSubject]);
  useEffect(() => { if (initialTopic)   setTopic(initialTopic);   }, [initialTopic]);

  const runSearch = useCallback(async (subj, top) => {
    const s = subj ?? subject;
    const t = top  ?? topic;
    if (!s) { toast.error('Please select a subject first'); return; }
    addToHistory(examType, {
      subject: s, topic: t || `All papers — ${s}`,
      subjectCode: subjects[s] || '', year, season,
    });
    await search({
      level: examType, subject: s,
      topic:  t || undefined,
      year:   year   ? parseInt(year) : undefined,
      season: season || undefined,
    });
  }, [subject, topic, year, season, examType, search, addToHistory, subjects]);

  const reSearch = (h) => {
    const t = h.topic === `All papers — ${h.subject}` ? '' : h.topic;
    setSubject(h.subject);
    setTopic(t);
    runSearch(h.subject, t);
  };

  const handleDownload = async (paper) => {
    try { await downloadPaper(paper.id, paper.source_url); toast.success('Downloaded'); }
    catch (e) { toast.error(e.message); }
  };

  const favKey = (paper) => ({ subject: paper.subject, topic: `${paper.season_label} — ${paper.paper_label}` });
  const accentGrad = `bg-gradient-to-r ${accentFrom} ${accentTo}`;

  // ── Recent pill component ──────────────────────────────────────
  const RecentPills = () => myHistory.length > 0 ? (
    <div className="pt-1">
      <p className="text-[11px] font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
        <History className="w-3 h-3" /> Recent searches
      </p>
      <div className="flex flex-wrap gap-1.5">
        {myHistory.map(h => (
          <button key={h.id} onClick={() => reSearch(h)}
            className="flex items-center gap-1 text-[11px] bg-gray-100 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 rounded-full px-2.5 py-1 transition-colors group max-w-[180px]">
            <Clock className="w-3 h-3 flex-shrink-0 text-gray-400 group-hover:text-blue-400" />
            <span className="truncate font-medium">{h.subject}</span>
            {h.topic && h.topic !== `All papers — ${h.subject}` && (
              <span className="truncate text-gray-400 group-hover:text-blue-400">· {h.topic}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-5">
      {/* Search card */}
      <Card className="border-none shadow-xl bg-white/90">
        <CardHeader className={`${accentGrad} rounded-t-xl py-4 px-5`}>
          <CardTitle className="flex items-center gap-2 text-white">
            <Search className="w-5 h-5" />Search Past Papers
          </CardTitle>
          <p className="text-white/70 text-[11px] mt-0.5">PapaCambridge · GCE Guide · Local cache</p>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <SearchableSubjectSelect subjects={subjects} selectedSubject={subject}
            onSelectSubject={setSubject} label="Subject" stepNumber="1" />

          <div>
            <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Topic / keyword <span className="text-gray-400 font-normal text-xs ml-1">(optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input placeholder="e.g. quadratic equations, photosynthesis…"
                value={topic} onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
                className="border-2 border-gray-200 rounded-xl" />
              {topic && (
                <Button size="icon" variant="ghost" onClick={() => setTopic('')}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            {showFilters ? 'Hide' : 'Show'} year & season filters
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="grid grid-cols-2 gap-3 overflow-hidden">
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Year</Label>
                  <select value={year} onChange={e => setYear(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl bg-white text-sm">
                    <option value="">All years</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block">Season</Label>
                  <select value={season} onChange={e => setSeason(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl bg-white text-sm">
                    <option value="">All seasons</option>
                    {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button onClick={() => runSearch()} disabled={!subject || isSearching}
            className={`w-full py-5 text-base font-semibold ${accentGrad} text-white hover:opacity-90 rounded-xl`}>
            {isSearching
              ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Searching…</>
              : <><Search className="w-5 h-5 mr-2" />Find Papers</>}
          </Button>

          {/* Recent searches below search bar */}
          <RecentPills />
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Search failed — {error}</p>
              <p className="text-xs text-red-400 mt-1">Backend: <code className="bg-red-100 px-1 rounded">{import.meta.env.VITE_API_URL || 'http://localhost:8000'}</code></p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Recent searches also shown above results */}
          <RecentPills />
          <p className="text-sm text-gray-500 mt-3 mb-3">{results.length} paper{results.length !== 1 ? 's' : ''} found</p>
          <div className="space-y-2.5">
            {results.map((paper, i) => {
              const srcStyle = SOURCE_STYLE[paper.source] || SOURCE_STYLE.papacambridge;
              const faved    = isFavourite(examType, favKey(paper));
              return (
                <motion.div key={paper.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}>
                  <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => setSelected(paper)}>
                    <div className={`h-0.5 bg-gradient-to-r ${accentFrom} ${accentTo} rounded-t-xl`} />
                    <CardContent className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                              <Calendar className="w-3 h-3" />{paper.season_label}
                            </span>
                            <span className="flex items-center gap-1 bg-blue-50 rounded-full px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              <Layers className="w-3 h-3" />{paper.paper_label}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${srcStyle}`}>
                              {paper.source === 'local' ? 'Local' : paper.source === 'papacambridge' ? 'PapaCambridge' : 'GCE Guide'}
                            </span>
                            {paper.has_markscheme && (
                              <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" />MS
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-900 truncate">{paper.subject} — {paper.subject_code}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <Button size="icon" variant="ghost"
                            onClick={() => toggleFavourite(examType, favKey(paper))}
                            className={`h-7 w-7 ${faved ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}>
                            <Star className={`w-3.5 h-3.5 ${faved ? 'fill-current' : ''}`} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setSelected(paper)}
                            className="h-7 w-7 text-blue-400 hover:text-blue-600">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDownload(paper)}
                            className="h-7 w-7 text-green-400 hover:text-green-600">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {!isSearching && results.length === 0 && !error && (
        <div className="text-center py-14">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-200" />
          </div>
          <p className="text-gray-300 text-sm">Select a subject and click Find Papers</p>
        </div>
      )}

      {/* Viewer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-5xl max-h-screen sm:max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
              onClick={e => e.stopPropagation()}>
              <PaperViewer paper={selected} onClose={() => setSelected(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
