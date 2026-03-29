import React, { useState, useCallback, useMemo } from 'react';
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
import { O_LEVEL_SUBJECTS as SUBJECTS } from '@/data/subjects';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useI18n } from '@/context/I18nContext';

const LEVEL    = 'O_LEVEL';
// SUBJECTS imported from @/data/subjects as O_LEVEL_SUBJECTS
const TAB_META = {
  papers:    { icon: Brain,    label: 'Search Questions', sub: 'Find & view past papers' },
  subjects:  { icon: Book,     label: 'My Subjects',      sub: 'Manage & track your subjects' },
  'ai-notes':{ icon: Sparkles, label: 'AI Notes',         sub: 'Generate smart study notes' },
  timer:     { icon: Clock,    label: 'Study Timer',      sub: 'Track your sessions' },
};
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const pageVariants = { initial:{opacity:0,y:16}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-8} };

function FavouritesSection({ level }) {
  const { favourites, toggleFavourite } = useAppContext();
  const { confirm, ConfirmUI } = useConfirm();
  const favs = favourites[level] || [];
  if (!favs.length) return <div className="text-center py-12"><Star className="w-12 h-12 mx-auto text-gray-200 mb-3"/><p className="text-gray-500 font-medium">No favourites yet</p></div>;
  return <><ConfirmUI/><div className="space-y-3">{favs.map(f=>(<motion.div key={f.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl"><div><p className="font-bold text-gray-900 dark:text-gray-100 text-base">{f.subject}</p><p className="text-sm text-gray-500 dark:text-gray-400">{f.topic}</p></div><div className="flex gap-2"><Button size="sm" onClick={()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:f.subject,topic:f.topic,autoSearch:true}}))} className="bg-emerald-600 text-white rounded-xl gap-1.5 h-9 text-sm"><SearchIcon className="w-3.5 h-3.5"/>Search again</Button><Button size="icon" variant="ghost" onClick={async()=>{const yes=await confirm({title:'Remove from Favourites?',message:`Remove "${f.subject}" from your favourites?`,confirmLabel:'Remove',danger:false});if(yes)toggleFavourite(level,f);}} className="h-9 w-9 text-yellow-500"><Star className="w-4 h-4 fill-current"/></Button></div></motion.div>))}</div></>;
}
function HistorySection({ level }) {
  const { history, clearHistory } = useAppContext();
  const { confirm, ConfirmUI } = useConfirm();
  const hist = history[level] || [];
  if (!hist.length) return <div className="text-center py-12"><History className="w-12 h-12 mx-auto text-gray-200 mb-3"/><p className="text-gray-500 font-medium">No history yet</p></div>;
  return <><ConfirmUI/><div><div className="flex justify-end mb-3"><Button size="sm" variant="ghost" onClick={async()=>{const yes=await confirm({title:'Clear search history?',message:'All recent searches for this level will be permanently removed.',confirmLabel:'Clear all',danger:true});if(yes)clearHistory(level);}} className="text-red-400 gap-1.5"><Trash2 className="w-3.5 h-3.5"/>Clear</Button></div><div className="space-y-3">{hist.map(h=>(<motion.div key={h.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="flex items-center justify-between p-4 bg-white dark:bg-[hsl(222,24%,12%)] border border-gray-200 rounded-2xl"><div><p className="font-bold text-gray-900 dark:text-gray-100 text-base">{h.subject}</p><p className="text-sm text-gray-500">{h.topic}</p><p className="text-xs text-gray-400">{new Date(h.searchedAt).toLocaleString()}</p></div><Button size="sm" variant="outline" onClick={()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:h.subject,topic:h.topic,autoSearch:true}}))} className="rounded-xl gap-1.5 h-9"><SearchIcon className="w-3.5 h-3.5"/>Search again</Button></motion.div>))}</div></div></>;
}
function DownloadsSection({ level }) {
  const [downloads,setDownloads]=React.useState([]);const [loading,setLoading]=React.useState(true);
  React.useEffect(()=>{fetch(`${API}/api/downloads/list?level=${level}`).then(r=>r.ok?r.json():{files:[]}).then(d=>{setDownloads(d.files||[]);setLoading(false);}).catch(()=>setLoading(false));},[level]);
  if(loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/></div>;
  if(!downloads.length) return <div className="text-center py-12"><FileDown className="w-12 h-12 mx-auto text-gray-200 mb-3"/><p className="text-gray-500 font-medium">No downloads yet</p></div>;
  return <div className="space-y-3">{downloads.map((f,i)=>(<motion.div key={f.paper_id||i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-emerald-600"/></div><div><p className="font-bold text-gray-900">{f.subject||f.paper_id}</p><p className="text-xs text-gray-400">{f.downloaded_at?new Date(f.downloaded_at).toLocaleDateString():''}</p></div></div><a href={`${API}/api/papers/view/${f.paper_id}`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-9"><Download className="w-3.5 h-3.5"/>Open</Button></a></motion.div>))}</div>;
}

export default function OLevelHub() {
  const { t } = useI18n();
  const [tab,setTab]=useState('papers');
  const cosmicStars = useMemo(()=>Array.from({length:50},(_,i)=>({
    id:i,x:Math.random()*100,y:Math.random()*100,
    r:Math.random()*1.6+0.4,op:Math.random()*0.4+0.12,
    dur:Math.random()*7+4,delay:Math.random()*-10,
  })),[]);
  const [subjectsTab,setSubjectsTab]=useState('mine');
  React.useEffect(()=>{const h=({detail})=>{if(detail?.tab)setTab(detail.tab);};window.addEventListener('switchTab',h);return()=>window.removeEventListener('switchTab',h);},[]);
  const [searchSubject,setSearchSubject]=useState('');
  const handleSearchSubject=useCallback(s=>{setSearchSubject(s.name);setTab('papers');setTimeout(()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:s.name,topic:'',autoSearch:true}})),150);},[]);
  const currentMeta=TAB_META[tab]||TAB_META.papers;
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="min-h-screen bg-[#05071a] pb-16 md:pb-0">
      <div className="relative overflow-hidden bg-[#05071a]" style={{minHeight:'210px'}}>
        <div className="absolute inset-0">
          {cosmicStars.map(s=>(
            <motion.div key={s.id} className="absolute rounded-full bg-white"
              style={{left:`${s.x}%`,top:`${s.y}%`,width:s.r,height:s.r,opacity:s.op}}
              animate={{opacity:[s.op,s.op*2.2,s.op]}}
              transition={{duration:s.dur,delay:s.delay,repeat:Infinity,ease:'easeInOut'}}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_55%,rgba(16,185,129,0.25),transparent_45%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_25%,rgba(6,182,212,0.18),transparent_40%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_85%,rgba(59,130,246,0.10),transparent_50%)]"/>
        </div>
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,1) 39px,rgba(255,255,255,1) 40px)'}}/>
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-40 h-40 opacity-20 hidden lg:block">
          {[0.5,0.75,1].map((sc,i)=>(
            <motion.div key={i} className="absolute inset-0 rounded-full border border-emerald-400"
              style={{transform:`scale(${sc})`}}
              animate={{rotate:360}} transition={{duration:10+i*5,repeat:Infinity,ease:'linear'}}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center text-2xl">📚</div>
        </div>
        <motion.div initial={{opacity:0,y:-18}} animate={{opacity:1,y:0}} transition={{duration:0.6}}
          className="relative z-10 max-w-full px-6 sm:px-10 py-12">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="bg-emerald-500/25 text-emerald-200 text-sm font-black px-4 py-1.5 rounded-full border border-emerald-400/30">O-Level</span>
            <span className="bg-white/10 text-white/60 text-sm px-4 py-1.5 rounded-full border border-white/10">Cambridge O Level</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-3 tracking-tight leading-none">
            <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent">O-Level</span>
            <span className="text-white ml-3">Study Hub</span>
          </h1>
          <p className="text-emerald-300/70 text-lg max-w-xl">General Certificate of Education — Ordinary Level</p>
          <div className="flex flex-wrap gap-3 mt-5">
            {['📖 Past papers','🤖 AI notes','⏱ Study timer','📊 Mark schemes'].map((f,i)=>(
              <motion.span key={f} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.4+i*0.08}}
                className="text-xs text-white/50 bg-white/[0.07] border border-white/10 px-3 py-1.5 rounded-full">{f}</motion.span>
            ))}
          </div>
        </motion.div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"/>
      <div className="max-w-full px-4 sm:px-8 py-8 bg-[#05071a]">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <div className="bg-white/[0.06] rounded-2xl border border-white/10 p-2 backdrop-blur-sm">
            <TabsList className="bg-transparent flex gap-1 h-auto w-full">
              {Object.entries(TAB_META).map(([value,{icon:Icon,label,sub}])=>(
                <TabsTrigger key={value} value={value} className="flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-700 data-[state=active]:to-teal-800 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-white/50 data-[state=inactive]:hover:bg-white/[0.08] data-[state=inactive]:hover:text-white/80">
                  <Icon className="w-5 h-5"/><span className="font-bold text-sm hidden sm:block">{label === 'Search Questions' ? t('tab.search') : label === 'My Subjects' ? t('tab.subjects') : label === 'AI Notes' ? t('tab.aiNotes') : t('tab.timer')}</span><span className="text-[10px] opacity-70 hidden lg:block">{sub}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}
              className="flex items-center gap-3 px-5 py-3 bg-white/[0.06] rounded-2xl border border-white/10 backdrop-blur-sm">
              <currentMeta.icon className="w-6 h-6 text-emerald-600 flex-shrink-0"/>
              <div><p className="font-bold text-white text-base">{currentMeta.label}</p><p className="text-white/50 text-sm">{currentMeta.sub}</p></div>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto"/>
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div key={tab} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{duration:0.22}}>
              <TabsContent value="papers" forceMount className={tab!=='papers'?'hidden':''}><QuestionSearch examType={LEVEL} subjects={SUBJECTS} initialSubject={searchSubject} accentFrom="from-emerald-700" accentTo="to-teal-700"/></TabsContent>
              <TabsContent value="subjects" forceMount className={tab!=='subjects'?'hidden':''}>
                <Card className="border-none shadow-xl bg-white dark:bg-[hsl(222,24%,12%)]">
                  <CardHeader className="border-b border-gray-100 dark:border-[hsl(222,18%,18%)] bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[hsl(222,28%,13%)] dark:to-[hsl(222,25%,14%)] pb-5">
                    <CardTitle className="flex items-center gap-2 text-xl"><Book className="w-6 h-6 text-emerald-600"/>My O-Level Subjects</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Manage subjects · favourites · history · downloads</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs value={subjectsTab} onValueChange={setSubjectsTab}>
                      <TabsList className="mb-6 bg-gray-100 dark:bg-[hsl(222,22%,15%)] h-auto p-1 rounded-xl gap-1">
                        {[{v:'mine',icon:Book,label:'My Subjects'},{v:'favs',icon:Star,label:'Favourites'},{v:'history',icon:History,label:'History'},{v:'downloads',icon:FileDown,label:'My Downloads'}].map(({v,icon:Icon,label})=>(
                          <TabsTrigger key={v} value={v} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[hsl(222,24%,18%)] data-[state=active]:shadow-sm">
                            <Icon className="w-3.5 h-3.5"/>{label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value="mine"><MySubjects level={LEVEL} subjectMap={SUBJECTS} accentClass="from-emerald-600 to-teal-700" onSearchSubject={handleSearchSubject}/></TabsContent>
                      <TabsContent value="favs"><FavouritesSection level={LEVEL}/></TabsContent>
                      <TabsContent value="history"><HistorySection level={LEVEL}/></TabsContent>
                      <TabsContent value="downloads"><DownloadsSection level={LEVEL}/></TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ai-notes" forceMount className={tab!=='ai-notes'?'hidden':''}><AINotesGenerator subjects={SUBJECTS} examType={LEVEL}/></TabsContent>
              <TabsContent value="timer" forceMount className={tab!=='timer'?'hidden':''}><StudyTimer level={LEVEL}/></TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
}
