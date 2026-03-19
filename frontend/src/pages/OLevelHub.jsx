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

const LEVEL    = 'O_LEVEL';
const SUBJECTS = {'Accounting':'7110','Biology':'5090','Chemistry':'5070','Commerce':'7100','Computer Science':'2210','Economics':'2281','English Language':'1123','Geography':'2217','History':'2147','Mathematics':'4024','Physics':'5054','Principles of Accounts':'7110'};
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
  const favs = favourites[level] || [];
  if (!favs.length) return <div className="text-center py-12"><Star className="w-12 h-12 mx-auto text-gray-200 mb-3"/><p className="text-gray-500 font-medium">No favourites yet</p></div>;
  return <div className="space-y-3">{favs.map(f=>(<motion.div key={f.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl"><div><p className="font-bold text-gray-900 text-base">{f.subject}</p><p className="text-sm text-gray-500">{f.topic}</p></div><div className="flex gap-2"><Button size="sm" onClick={()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:f.subject,topic:f.topic,autoSearch:true}}))} className="bg-emerald-600 text-white rounded-xl gap-1.5 h-9 text-sm"><SearchIcon className="w-3.5 h-3.5"/>Search again</Button><Button size="icon" variant="ghost" onClick={()=>toggleFavourite(level,f)} className="h-9 w-9 text-yellow-500"><Star className="w-4 h-4 fill-current"/></Button></div></motion.div>))}</div>;
}
function HistorySection({ level }) {
  const { history, clearHistory } = useAppContext();
  const hist = history[level] || [];
  if (!hist.length) return <div className="text-center py-12"><History className="w-12 h-12 mx-auto text-gray-200 mb-3"/><p className="text-gray-500 font-medium">No history yet</p></div>;
  return <div><div className="flex justify-end mb-3"><Button size="sm" variant="ghost" onClick={()=>clearHistory(level)} className="text-red-400 gap-1.5"><Trash2 className="w-3.5 h-3.5"/>Clear</Button></div><div className="space-y-3">{hist.map(h=>(<motion.div key={h.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="flex items-center justify-between p-4 bg-white dark:bg-[hsl(222,24%,12%)] border border-gray-200 rounded-2xl"><div><p className="font-bold text-gray-900 dark:text-gray-100 text-base">{h.subject}</p><p className="text-sm text-gray-500">{h.topic}</p><p className="text-xs text-gray-400">{new Date(h.searchedAt).toLocaleString()}</p></div><Button size="sm" variant="outline" onClick={()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:h.subject,topic:h.topic,autoSearch:true}}))} className="rounded-xl gap-1.5 h-9"><SearchIcon className="w-3.5 h-3.5"/>Search again</Button></motion.div>))}</div></div>;
}
function DownloadsSection({ level }) {
  const [downloads,setDownloads]=React.useState([]);const [loading,setLoading]=React.useState(true);
  React.useEffect(()=>{fetch(`${API}/api/downloads/list?level=${level}`).then(r=>r.ok?r.json():{files:[]}).then(d=>{setDownloads(d.files||[]);setLoading(false);}).catch(()=>setLoading(false));},[level]);
  if(loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"/></div>;
  if(!downloads.length) return <div className="text-center py-12"><FileDown className="w-12 h-12 mx-auto text-gray-200 mb-3"/><p className="text-gray-500 font-medium">No downloads yet</p></div>;
  return <div className="space-y-3">{downloads.map((f,i)=>(<motion.div key={f.paper_id||i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-emerald-600"/></div><div><p className="font-bold text-gray-900">{f.subject||f.paper_id}</p><p className="text-xs text-gray-400">{f.downloaded_at?new Date(f.downloaded_at).toLocaleDateString():''}</p></div></div><a href={`${API}/api/papers/view/${f.paper_id}`} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-9"><Download className="w-3.5 h-3.5"/>Open</Button></a></motion.div>))}</div>;
}

export default function OLevelHub() {
  const [tab,setTab]=useState('papers');
  const [subjectsTab,setSubjectsTab]=useState('mine');
  React.useEffect(()=>{const h=({detail})=>{if(detail?.tab)setTab(detail.tab);};window.addEventListener('switchTab',h);return()=>window.removeEventListener('switchTab',h);},[]);
  const [searchSubject,setSearchSubject]=useState('');
  const handleSearchSubject=useCallback(s=>{setSearchSubject(s.name);setTab('papers');setTimeout(()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:s.name,topic:'',autoSearch:true}})),150);},[]);
  const currentMeta=TAB_META[tab]||TAB_META.papers;
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}} className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-100/50 dark:from-[hsl(222,28%,8%)] dark:to-[hsl(222,24%,10%)]">
      <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(rgba(255,255,255,.5) 1px, transparent 1px)',backgroundSize:'20px 20px'}}/>
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="relative max-w-full px-6 sm:px-10 py-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-white/20 text-sm font-bold px-4 py-1.5 rounded-full border border-white/25">O-Level</span>
            <span className="bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full">Cambridge O Level</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-2 tracking-tight">O-Level Study Hub</h1>
          <p className="text-white/75 text-lg">General Certificate of Education — Ordinary Level</p>
          <div className="flex items-center gap-2 mt-4"><Zap className="w-4 h-4 text-yellow-300"/><p className="text-white/70 text-sm">Search · Study · Succeed</p></div>
        </motion.div>
      </div>
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"/>
      <div className="max-w-full px-4 sm:px-8 py-8">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <div className="bg-white dark:bg-[hsl(222,24%,12%)] rounded-2xl shadow-lg border border-gray-100 dark:border-[hsl(222,18%,20%)] p-2">
            <TabsList className="bg-transparent flex gap-1 h-auto w-full">
              {Object.entries(TAB_META).map(([value,{icon:Icon,label,sub}])=>(
                <TabsTrigger key={value} value={value} className="flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl transition-all data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-700 data-[state=active]:to-teal-800 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-emerald-50 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:bg-[hsl(222,22%,16%)]">
                  <Icon className="w-5 h-5"/><span className="font-bold text-sm hidden sm:block">{label}</span><span className="text-[10px] opacity-70 hidden lg:block">{sub}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}
              className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-[hsl(222,24%,12%)] rounded-2xl border border-gray-100 dark:border-[hsl(222,18%,20%)] shadow-sm">
              <currentMeta.icon className="w-6 h-6 text-emerald-600 flex-shrink-0"/>
              <div><p className="font-bold text-gray-900 dark:text-gray-100 text-base">{currentMeta.label}</p><p className="text-gray-500 text-sm">{currentMeta.sub}</p></div>
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
