/**
 * QuestionSearch.jsx
 * - Renamed: "Search Questions" (was "Search Past Papers")
 * - Demo history: 3 sample entries shown when user has no real history
 * - Demo clears itself after the first real search
 * - ReadAloudZone wraps results so any section can be read aloud
 * - Layout spread out (no max-width centre lock)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Search, Download, Eye, Loader2, FileText, Star, Upload,
  Calendar, Layers, CheckCircle, AlertCircle,
  Filter, ChevronDown, ChevronUp, Clock, History, X, Volume2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SearchableSubjectSelect from './SearchableSubjectSelect';
import PaperViewer from './PaperViewer';
import { usePaperSearch, downloadPaper } from '@/hooks/usePaperSearch';
import { useAppContext } from '@/context/AppContext';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useI18n } from '@/context/I18nContext';
import { ReadAloudZone } from '@/components/ui/read-aloud';
import PaperAnalyser from '@/components/academic/PaperAnalyser';

const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => 2024 - i);
const SEASONS = [
  { value: 'm_j', label: 'May / June' },
  { value: 'o_n', label: 'Oct / Nov' },
  { value: 'f_m', label: 'Feb / March' },
];
const SOURCE_STYLE = {
  local:         'bg-green-50 text-green-800 border-green-200',
  papacambridge: 'bg-blue-50 text-blue-800 border-blue-200',
  gceguide:      'bg-purple-50 text-purple-800 border-purple-200',
};

// Demo entries per exam level — shown when user has zero real history
const DEMO_HISTORY = {
  IGCSE: [
    { id: 'demo1', subject: 'Mathematics',             topic: 'Quadratic equations',           subjectCode: '0580', demo: true },
    { id: 'demo2', subject: 'Biology',                 topic: 'Photosynthesis and respiration', subjectCode: '0610', demo: true },
    { id: 'demo3', subject: 'English - First Language',topic: 'Directed writing techniques',   subjectCode: '0500', demo: true },
    { id: 'demo4', subject: 'Chemistry',               topic: 'Acids, bases and salts',        subjectCode: '0620', demo: true },
    { id: 'demo5', subject: 'Physics',                 topic: 'Forces and motion',             subjectCode: '0625', demo: true },
  ],
  AS_LEVEL: [
    { id: 'demo1', subject: 'Mathematics',             topic: 'Integration techniques',        subjectCode: '9709', demo: true },
    { id: 'demo2', subject: 'Physics',                 topic: 'Circular motion and gravity',   subjectCode: '9702', demo: true },
    { id: 'demo3', subject: 'Economics',               topic: 'Market structures',             subjectCode: '9708', demo: true },
    { id: 'demo4', subject: 'Chemistry',               topic: 'Organic chemistry mechanisms',  subjectCode: '9701', demo: true },
    { id: 'demo5', subject: 'Biology',                 topic: 'DNA replication and genetics',  subjectCode: '9700', demo: true },
  ],
  O_LEVEL: [
    { id: 'demo1', subject: 'Mathematics',             topic: 'Algebra and simultaneous equations', subjectCode: '4024', demo: true },
    { id: 'demo2', subject: 'Chemistry',               topic: 'Atomic structure and bonding',  subjectCode: '5070', demo: true },
    { id: 'demo3', subject: 'English Language',        topic: 'Comprehension and summary',     subjectCode: '1123', demo: true },
    { id: 'demo4', subject: 'Physics',                 topic: 'Waves and optics',              subjectCode: '5054', demo: true },
    { id: 'demo5', subject: 'Biology',                 topic: 'Cell biology and diffusion',    subjectCode: '5090', demo: true },
  ],
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
  const [selectedPaper, setSelectedPaper] = useState(null);

  const { results, isSearching, error, search } = usePaperSearch();
  const { addToHistory, history, toggleFavourite, isFavourite } = useAppContext();
  const { confirm, ConfirmUI: ConfirmFav } = useConfirm();
  const { t } = useI18n();

  const realHistory   = history[examType] || [];
  const demoHistory   = DEMO_HISTORY[examType] || [];
  // Show demo entries only when user has no real searches yet
  const displayHistory = realHistory.length > 0 ? realHistory.slice(0, 8) : demoHistory;
  const isDemo         = realHistory.length === 0;

  // Listen for switchTab events from the secondary nav
  useEffect(() => {
    const h = () => {}; // tab switching handled at suite level
    return () => {};
  }, []);

  const topicRef = React.useRef(null);

  useEffect(() => {
    const handler = ({ detail }) => {
      if (detail.subject) setSubject(detail.subject);
      if (detail.topic !== undefined) setTopic(detail.topic || '');
      if (detail.autoSearch) setTimeout(() => runSearch(detail.subject, detail.topic), 80);
    };
    window.addEventListener('searchAgain', handler);
    return () => window.removeEventListener('searchAgain', handler);
  }, []);

  // Global / key focuses the topic input
  useEffect(() => {
    const handler = () => {
      setSearchMode('search');
      setTimeout(() => topicRef.current?.focus(), 50);
    };
    window.addEventListener('focusSearch', handler);
    return () => window.removeEventListener('focusSearch', handler);
  }, []);

  useEffect(() => { if (initialSubject) setSubject(initialSubject); }, [initialSubject]);
  useEffect(() => { if (initialTopic)   setTopic(initialTopic);     }, [initialTopic]);

  const runSearch = useCallback(async (subj, top) => {
    const s = subj ?? subject;
    const t = top  ?? topic;
    if (!s) { toast.error('Please select a subject first'); return; }
    // First real search — demo history disappears automatically because realHistory.length > 0
    addToHistory(examType, {
      subject: s, topic: t || `All papers — ${s}`,
      subjectCode: (typeof subjects[s] === 'object' ? subjects[s].code : subjects[s]) || '',
      year, season, paper: selectedPaper || undefined,
    });
    await search({
      level: examType, subject: s,
      topic:  t || undefined,
      year:   year   ? parseInt(year) : undefined,
      season: season || undefined,
      paper:  selectedPaper || undefined,
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

  const favKey  = (paper) => ({ subject: paper.subject, topic: `${paper.season_label} — ${paper.paper_label}` });
  const accentG = `bg-gradient-to-r ${accentFrom} ${accentTo}`;

  const HistoryPills = () => (
    <div className="pt-1">
      <p className="text-[11px] font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
        <History className="w-3 h-3" />
        {isDemo ? 'Try one of these examples:' : t('search.recent')}
        {isDemo && <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">demo</span>}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {displayHistory.map(h => (
          <button key={h.id} onClick={() => reSearch(h)}
            className={`flex items-center gap-1 text-[11px] border rounded-full px-2.5 py-1 transition-colors max-w-[200px] group
              ${isDemo
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300'
                : 'bg-gray-100 hover:bg-blue-50 hover:text-blue-700 border-gray-200 hover:border-blue-300 text-gray-700'}`}>
            <Clock className="w-3 h-3 flex-shrink-0 opacity-60" />
            <span className="truncate font-medium">{h.subject}</span>
            {h.topic && h.topic !== `All papers — ${h.subject}` && (
              <span className="truncate opacity-60"> · {h.topic}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const [searchMode, setSearchMode] = useState('search');

  return (
    <div className="space-y-5 w-full">
      <ConfirmFav />

      {/* ── Mode selector ── */}
      <div className="flex gap-2 bg-white dark:bg-[hsl(222,24%,12%)] p-1.5 rounded-2xl border border-gray-200 dark:border-[hsl(222,18%,22%)] shadow-sm">
        <button onClick={() => setSearchMode('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            searchMode === 'search'
              ? `bg-gradient-to-r ${accentFrom} ${accentTo} text-white shadow-sm`
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}>
          <Search className="w-4 h-4"/>Search Cambridge Papers
        </button>
        <button onClick={() => setSearchMode('upload')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            searchMode === 'upload'
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}>
          <Upload className="w-4 h-4"/>Upload & Analyse Paper
        </button>
      </div>

      {searchMode === 'upload' && (
        <PaperAnalyser subjects={subjects} examType={examType}/>
      )}

      {searchMode === 'search' && <>

      {/* ── Search card ── */}
      <Card className="border-none shadow-xl bg-white dark:bg-[hsl(222,24%,11%)] w-full">
        <CardHeader className={`${accentG} rounded-t-xl py-4 px-6`}>
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Search className="w-5 h-5" />{t('search.title')}
          </CardTitle>
          <p className="text-white/70 text-xs mt-0.5">PapaCambridge · GCE Guide · Local cache</p>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Left col: subject + topic */}
            <div className="space-y-4">
              <SearchableSubjectSelect subjects={subjects} selectedSubject={subject}
                onSelectSubject={setSubject} selectedPaper={selectedPaper}
                onSelectPaper={setSelectedPaper} label="Subject" stepNumber="1" />
              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <span className={`${accentG} text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold`}>2</span>
                  Topic / keyword <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. quadratic equations, photosynthesis…"
                    value={topic} onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && runSearch()}
                    className="border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl dark:bg-[hsl(222,22%,13%)] dark:text-gray-200" />
                  {topic && (
                    <Button size="icon" variant="ghost" onClick={() => setTopic('')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right col: filters + search button */}
            <div className="flex flex-col justify-between gap-4">
              <div>
                <button onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-3">
                  <Filter className="w-3.5 h-3.5" />
                  {showFilters ? 'Hide' : 'Year & season filters'}
                  {showFilters ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                </button>
                <AnimatePresence>
                  {showFilters && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                      className="grid grid-cols-2 gap-3 overflow-hidden">
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block dark:text-gray-300">Year</Label>
                        <select value={year} onChange={e => setYear(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl bg-white dark:bg-[hsl(222,22%,13%)] dark:text-gray-200 text-sm">
                          <option value="">All years</option>
                          {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs font-semibold mb-1.5 block dark:text-gray-300">Season</Label>
                        <select value={season} onChange={e => setSeason(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl bg-white dark:bg-[hsl(222,22%,13%)] dark:text-gray-200 text-sm">
                          <option value="">All seasons</option>
                          {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button onClick={() => runSearch()} disabled={!subject || isSearching}
                className={`w-full py-5 text-base font-semibold ${accentG} text-white hover:opacity-90 rounded-xl`}>
                {isSearching
                  ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/>Searching…</>
                  : <><Search className="w-5 h-5 mr-2"/>{t('search.findBtn')}</>}
              </Button>
            </div>
          </div>

          <HistoryPills />
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Search failed — {error}</p>
              <p className="text-xs text-red-400 mt-1">Backend: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">{import.meta.env.VITE_API_URL||'http://localhost:8000'}</code></p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skeleton shimmer while searching */}
      {isSearching && searchMode === 'search' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-3">
          <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin"/>Searching across sources…
          </p>
          {[1,2,3,4].map(i=>(
            <div key={i} className="rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-pulse"
              style={{animationDelay:`${i*80}ms`}}>
              <div className="h-0.5 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-white/10 dark:to-white/5"/>
              <div className="p-4 space-y-2.5">
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-white/10 rounded-full"/>
                  <div className="h-5 w-24 bg-gray-200 dark:bg-white/10 rounded-full"/>
                  <div className="h-5 w-16 bg-gray-100 dark:bg-white/[0.06] rounded-full"/>
                </div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded-lg"/>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
          <div className="flex items-center justify-between mb-4">
            <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
              className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800 text-sm font-bold">
                <CheckCircle className="w-3.5 h-3.5"/>
                {results.length} result{results.length!==1?'s':''} found
              </div>
            </motion.div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Click any card to view</p>
          </div>
          <ReadAloudZone label="Search results" className="space-y-2.5">
            {results.map((paper, i) => {
              const srcStyle = SOURCE_STYLE[paper.source] || SOURCE_STYLE.papacambridge;
              const faved    = isFavourite(examType, favKey(paper));
              return (
                <motion.div key={paper.id}
                  initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}>
                  <Card
                    className="border border-gray-200 dark:border-[hsl(222,18%,22%)] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-[hsl(222,24%,12%)]"
                    onClick={() => setSelected(paper)}>
                    <div className={`h-0.5 bg-gradient-to-r ${accentFrom} ${accentTo} rounded-t-xl`}/>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">{paper.subject} — {paper.subject_code}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="flex items-center gap-1 bg-gray-100 dark:bg-[hsl(222,22%,18%)] rounded-full px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                              <Calendar className="w-3 h-3"/>{paper.season_label}
                            </span>
                            <span className="flex items-center gap-1 bg-blue-50 dark:bg-[hsl(222,35%,17%)] rounded-full px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                              <Layers className="w-3 h-3"/>{paper.paper_label}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${srcStyle}`}>
                              {paper.source==='local'?'Local':paper.source==='papacambridge'?'PapaCambridge':'GCE Guide'}
                            </span>
                            {paper.has_markscheme && (
                              <span className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3"/>MS
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0" onClick={e=>e.stopPropagation()}>
                          <Button size="icon" variant="ghost"
                            onClick={async()=>{if(faved){const yes=await confirm({title:'Remove from Favourites?',message:`Remove this ${paper.subject} paper from your favourites?`,confirmLabel:'Remove',danger:false});if(yes)toggleFavourite(examType,favKey(paper));}else{toggleFavourite(examType,favKey(paper));}}}
                            className={`h-8 w-8 ${faved?'text-yellow-500':'text-gray-300 hover:text-yellow-400'}`}>
                            <Star className={`w-4 h-4 ${faved?'fill-current':''}`}/>
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setSelected(paper)}
                            className="h-8 w-8 text-blue-400 hover:text-blue-600">
                            <Eye className="w-4 h-4"/>
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDownload(paper)}
                            className="h-8 w-8 text-green-400 hover:text-green-600">
                            <Download className="w-4 h-4"/>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </ReadAloudZone>
        </motion.div>
      )}

      {/* Animated empty state */}
      {!isSearching && results.length===0 && !error && searchMode === 'search' && (
        <motion.div className="text-center py-16" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <div className="relative w-24 h-24 mx-auto mb-5">
            {/* Animated rings */}
            {[0,1,2].map(i => (
              <motion.div key={i}
                className="absolute inset-0 rounded-full border-2 border-blue-400/20 dark:border-blue-500/20"
                animate={{ scale:[1, 1.5+i*0.3, 1], opacity:[0.6,0,0.6] }}
                transition={{ duration:2.5, delay:i*0.4, repeat:Infinity, ease:'easeInOut' }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accentFrom} ${accentTo} flex items-center justify-center shadow-lg`}>
                <FileText className="w-8 h-8 text-white"/>
              </div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold text-base mb-1">Ready to search</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">Select a subject and click Find Questions</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            💡 Try one of the example searches above — or type your own topic
          </p>
        </motion.div>
      )}

      </> /* end searchMode === 'search' */ }

      {/* Viewer modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
              transition={{type:'spring',damping:28,stiffness:300}}
              className="w-full max-w-6xl max-h-screen sm:max-h-[95vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
              onClick={e=>e.stopPropagation()}>
              <PaperViewer paper={selected} onClose={() => setSelected(null)}/>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
