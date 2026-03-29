import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Clock, Book, Star, Search as SearchIcon, History, Trash2, Download, FileDown, BookOpen, ArrowRight, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QuestionSearch   from '@/components/academic/QuestionSearch';
import AINotesGenerator from '@/components/academic/AINotesGenerator';
import StudyTimer       from '@/components/academic/StudyTimer';
import MySubjects       from '@/components/academic/MySubjects';
import { useAppContext } from '@/context/AppContext';
import { IGCSE_SUBJECTS } from '@/data/subjects';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useI18n } from '@/context/I18nContext';

const LEVEL = 'IGCSE';
// IGCSE_SUBJECTS imported from @/data/subjects

const TAB_META = {
  papers:    { icon: Brain,     label: 'Search Questions', sub: 'Find & view past papers' },
  subjects:  { icon: Book,      label: 'My Subjects',      sub: 'Manage & track your subjects' },
  'ai-notes':{ icon: Sparkles,  label: 'AI Notes',         sub: 'Generate smart study notes' },
  timer:     { icon: Clock,     label: 'Study Timer',      sub: 'Track your sessions' },
};

function FavouritesSection({ level }) {
  const { favourites, toggleFavourite } = useAppContext();
  const { confirm, ConfirmUI } = useConfirm();
  const favs = favourites[level] || [];
  if (!favs.length) return (
    <div className="text-center py-12">
      <Star className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
      <p className="text-gray-500 font-medium">No favourites yet</p>
      <p className="text-gray-400 text-sm mt-1">Star any search result to save it here</p>
    </div>
  );
  return (
    <div className="space-y-3">
      <ConfirmUI />
      {favs.map(f => (
        <motion.div key={f.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
          className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-[hsl(40,25%,12%)] border border-yellow-200 dark:border-yellow-900/40 rounded-2xl hover:shadow-md transition-all">
          <div>
            <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{f.subject}</p>
            <p className="text-sm text-gray-500 mt-0.5">{f.topic}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:f.subject,topic:f.topic,autoSearch:true}}))}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-1.5 text-sm h-9">
              <SearchIcon className="w-3.5 h-3.5"/>Search again
            </Button>
            <Button size="icon" variant="ghost" onClick={async()=>{const yes=await confirm({title:"Remove from Favourites?",message:`Remove "${f.subject}" from your favourites?`,confirmLabel:"Remove",danger:false});if(yes)toggleFavourite(level,f);}} className="h-9 w-9 text-yellow-500">
              <Star className="w-4 h-4 fill-current"/>
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function HistorySection({ level }) {
  const { history, clearHistory } = useAppContext();
  const { confirm, ConfirmUI: ConfirmClearHistory } = useConfirm();
  const hist = history[level] || [];
  if (!hist.length) return (
    <div className="text-center py-12">
      <History className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
      <p className="text-gray-500 font-medium">No search history yet</p>
      <p className="text-gray-400 text-sm mt-1">Your searches will appear here</p>
    </div>
  );
  return (
    <div>
      <div className="flex justify-end mb-3">
        <ConfirmClearHistory />
        <Button size="sm" variant="ghost" onClick={async()=>{const yes=await confirm({title:"Clear search history?",message:"All recent searches for this level will be permanently removed.",confirmLabel:"Clear all",danger:true});if(yes)clearHistory(level);}} className="text-red-400 hover:text-red-600 gap-1.5">
          <Trash2 className="w-3.5 h-3.5"/>Clear all
        </Button>
      </div>
      <div className="space-y-3">
        {/* ConfirmClearHistory renders the dialog */}
        {hist.map(h => (
          <motion.div key={h.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
            className="flex items-center justify-between p-4 bg-white dark:bg-[hsl(222,24%,12%)] border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all">
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{h.subject}</p>
              <p className="text-sm text-gray-500">{h.topic}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(h.searchedAt).toLocaleString()}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:h.subject,topic:h.topic,autoSearch:true}}))}
              className="rounded-xl gap-1.5 h-9">
              <SearchIcon className="w-3.5 h-3.5"/>Search again
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DownloadsSection({ level }) {
  const [downloads, setDownloads] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  React.useEffect(() => {
    fetch(`${API}/api/downloads/list?level=${level}`)
      .then(r => r.ok ? r.json() : { files: [] })
      .then(d => { setDownloads(d.files || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [level]);

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/></div>;
  if (!downloads.length) return (
    <div className="text-center py-12">
      <FileDown className="w-12 h-12 mx-auto text-gray-200 mb-3"/>
      <p className="text-gray-500 font-medium">No downloaded papers yet</p>
      <p className="text-gray-400 text-sm mt-1">Papers you save from search results will appear here</p>
    </div>
  );
  return (
    <div className="space-y-3">
      {downloads.map((f, i) => (
        <motion.div key={f.paper_id || i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}
          className="flex items-center justify-between p-4 bg-white dark:bg-[hsl(222,24%,12%)] border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-gray-100">{f.subject || f.paper_id}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.downloaded_at ? new Date(f.downloaded_at).toLocaleDateString() : ''} · {f.file_size_kb ? `${f.file_size_kb} KB` : ''}</p>
            </div>
          </div>
          <a href={`${API}/api/papers/view/${f.paper_id}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-9">
              <Download className="w-3.5 h-3.5"/>Open
            </Button>
          </a>
        </motion.div>
      ))}
    </div>
  );
}

const pageVariants = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-8} };

export default function AcademicHub() {
  const { t } = useI18n();
  const [tab, setTab] = useState('papers');
  // Stable cosmic starfield
  const cosmicStars = React.useMemo(() => Array.from({length:55},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    r:Math.random()*1.6+0.4, op:Math.random()*0.45+0.12,
    dur:Math.random()*7+4, delay:Math.random()*-10,
  })),[]);
  const [subjectsTab, setSubjectsTab] = useState('mine');
  React.useEffect(() => { const h=({detail})=>{if(detail?.tab)setTab(detail.tab);}; window.addEventListener('switchTab',h); return()=>window.removeEventListener('switchTab',h); }, []);
  const [searchSubject, setSearchSubject] = useState('');
  const handleSearchSubject = useCallback(s => { setSearchSubject(s.name); setTab('papers'); setTimeout(()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:s.name,topic:'',autoSearch:true}})),150); },[]);
  const currentMeta = TAB_META[tab] || TAB_META.papers;

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}
      className="min-h-screen bg-[#05071a] pb-16 md:pb-0">

      {/* ── Cosmic hero banner ── */}
      <div className="relative overflow-hidden bg-[#05071a]" style={{minHeight:'220px'}}>
        {/* Deep starfield */}
        <div className="absolute inset-0">
          {cosmicStars.map(s=>(
            <motion.div key={s.id} className="absolute rounded-full bg-white"
              style={{left:`${s.x}%`,top:`${s.y}%`,width:s.r,height:s.r,opacity:s.op}}
              animate={{opacity:[s.op,s.op*2.2,s.op],scale:[1,1.5,1]}}
              transition={{duration:s.dur,delay:s.delay,repeat:Infinity,ease:'easeInOut'}}
            />
          ))}
          {/* Nebula layers */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_60%,rgba(59,130,246,0.35),transparent_45%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_30%,rgba(99,102,241,0.25),transparent_40%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_80%,rgba(16,185,129,0.12),transparent_50%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(245,158,11,0.08),transparent_40%)]"/>
        </div>
        {/* Floating orbit rings */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-44 h-44 opacity-20 hidden lg:block">
          {[0.5,0.75,1].map((scale,i)=>(
            <motion.div key={i} className="absolute inset-0 rounded-full border border-blue-400"
              style={{transform:`scale(${scale})`}}
              animate={{rotate:360}} transition={{duration:12+i*6,repeat:Infinity,ease:'linear'}}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-2xl">🎓</div>
          </div>
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px)'}}/>

        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}
          className="relative z-10 max-w-full px-6 sm:px-10 py-12">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <motion.span whileHover={{scale:1.05}} className="bg-blue-500/25 text-blue-200 text-sm font-black px-4 py-1.5 rounded-full border border-blue-400/30 backdrop-blur-sm">
              IGCSE
            </motion.span>
            <span className="bg-white/10 text-white/60 text-sm px-4 py-1.5 rounded-full border border-white/10">O-Level equivalent</span>
            <motion.span initial={{scale:0}} animate={{scale:1}} transition={{delay:0.5,type:'spring'}}
              className="bg-yellow-400/15 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full border border-yellow-400/25 flex items-center gap-1">
              <Zap className="w-3 h-3"/>40+ subjects
            </motion.span>
          </div>
          <motion.h1 initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.15}}
            className="text-5xl md:text-7xl font-black mb-3 tracking-tight leading-none">
            <span className="bg-gradient-to-r from-blue-300 via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              IGCSE
            </span>
            <span className="text-white ml-3">Study Hub</span>
          </motion.h1>
          <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}
            className="text-blue-300/70 text-lg max-w-xl">
            International General Certificate of Secondary Education
          </motion.p>
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.45}}
            className="flex flex-wrap items-center gap-3 mt-5">
            {['📄 Past papers','🤖 AI notes','⏱ Study timer','📊 Mark schemes'].map((f,i)=>(
              <motion.span key={f} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
                transition={{delay:0.5+i*0.08}}
                className="text-xs text-white/50 bg-white/[0.07] border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                {f}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"/>

      <div className="max-w-full px-4 sm:px-8 py-8 bg-[#05071a]">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">

          {/* Tab bar */}
          <div className="bg-white/[0.06] rounded-2xl border border-white/10 p-2 backdrop-blur-sm">
            <TabsList className="bg-transparent flex gap-1 h-auto w-full">
              {Object.entries(TAB_META).map(([value, {icon:Icon, label, sub}]) => (
                <TabsTrigger key={value} value={value} className="flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl text-left transition-all
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-700 data-[state=active]:to-indigo-800 data-[state=active]:text-white data-[state=active]:shadow-lg
                  data-[state=inactive]:text-white/50 data-[state=inactive]:hover:bg-white/[0.08] data-[state=inactive]:hover:text-white/80">
                  <Icon className="w-5 h-5"/>
                  <span className="font-bold text-sm hidden sm:block">{label === 'Search Questions' ? t('tab.search') : label === 'My Subjects' ? t('tab.subjects') : label === 'AI Notes' ? t('tab.aiNotes') : t('tab.timer')}</span>
                  <span className="text-[10px] opacity-70 hidden lg:block">{sub}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Current tab context banner */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.18}}
              className="flex items-center gap-3 px-5 py-3 bg-white/[0.06] rounded-2xl border border-white/10 backdrop-blur-sm">
              <currentMeta.icon className="w-6 h-6 text-blue-600 flex-shrink-0"/>
              <div>
                <p className="font-bold text-white text-base">{currentMeta.label}</p>
                <p className="text-white/50 text-sm">{currentMeta.sub}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto"/>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={tab} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{duration:0.22}}>

              <TabsContent value="papers" forceMount className={tab!=='papers'?'hidden':''}>
                <QuestionSearch examType={LEVEL} subjects={IGCSE_SUBJECTS} initialSubject={searchSubject} accentFrom="from-blue-700" accentTo="to-indigo-800"/>
              </TabsContent>

              <TabsContent value="subjects" forceMount className={tab!=='subjects'?'hidden':''}>
                <Card className="border-none shadow-xl bg-white dark:bg-[hsl(222,24%,12%)]">
                  <CardHeader className="border-b border-gray-100 dark:border-[hsl(222,18%,18%)] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[hsl(222,28%,13%)] dark:to-[hsl(235,25%,14%)] pb-5">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Book className="w-6 h-6 text-blue-600"/>My IGCSE Subjects
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your subjects · view favourites · track history · access downloads</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs value={subjectsTab} onValueChange={setSubjectsTab}>
                      <TabsList className="mb-6 bg-gray-100 dark:bg-[hsl(222,22%,15%)] h-auto p-1 rounded-xl gap-1">
                        {[
                          {v:'mine',     icon:Book,     label:'My Subjects'},
                          {v:'favs',     icon:Star,     label:'Favourites'},
                          {v:'history',  icon:History,  label:'History'},
                          {v:'downloads',icon:FileDown, label:'My Downloads'},
                        ].map(({v,icon:Icon,label})=>(
                          <TabsTrigger key={v} value={v}
                            className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[hsl(222,24%,18%)] data-[state=active]:shadow-sm">
                            <Icon className="w-3.5 h-3.5"/>{label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value="mine"><MySubjects level={LEVEL} subjectMap={IGCSE_SUBJECTS} accentClass="from-blue-600 to-indigo-700" onSearchSubject={handleSearchSubject}/></TabsContent>
                      <TabsContent value="favs"><FavouritesSection level={LEVEL}/></TabsContent>
                      <TabsContent value="history"><HistorySection level={LEVEL}/></TabsContent>
                      <TabsContent value="downloads"><DownloadsSection level={LEVEL}/></TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai-notes" forceMount className={tab!=='ai-notes'?'hidden':''}>
                <AINotesGenerator subjects={IGCSE_SUBJECTS} examType={LEVEL}/>
              </TabsContent>

              <TabsContent value="timer" forceMount className={tab!=='timer'?'hidden':''}>
                <StudyTimer level={LEVEL}/>
              </TabsContent>

            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
}
