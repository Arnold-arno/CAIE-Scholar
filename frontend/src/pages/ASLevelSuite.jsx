import React, { useState, useCallback } from 'react';
import { Brain, Sparkles, Clock, Book, Star, Search as SearchIcon, History, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import QuestionSearch   from '@/components/academic/QuestionSearch';
import AINotesGenerator from '@/components/academic/AINotesGenerator';
import StudyTimer       from '@/components/academic/StudyTimer';
import MySubjects       from '@/components/academic/MySubjects';
import { useAppContext } from '@/context/AppContext';

const LEVEL = 'AS_LEVEL';
const SUBJECTS = {'Accounting':'9706','Biology':'9700','Business':'9609','Chemistry':'9701','Computer Science':'9618','Economics':'9708','English Language':'9093','Geography':'9696','History':'9489','Mathematics':'9709','Physics':'9702','Psychology':'9990','Sociology':'9699'};

function FavouritesSection({level}) {
  const { favourites, toggleFavourite } = useAppContext();
  const favs = favourites[level]||[];
  if (!favs.length) return <div className="text-center py-8 text-gray-400"><Star className="w-8 h-8 mx-auto mb-2 opacity-30"/><p className="text-sm">No favourites yet</p></div>;
  return <div className="space-y-2">{favs.map(f=>(
    <div key={f.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 hover:border-amber-300 rounded-xl transition-all">
      <div><p className="font-semibold text-sm">{f.subject}</p><p className="text-xs text-gray-500">{f.topic}</p></div>
      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" onClick={()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:f.subject,topic:f.topic,autoSearch:true}}))} className="h-7 text-xs gap-1"><SearchIcon className="w-3 h-3"/>Search again</Button>
        <Button size="icon" variant="ghost" onClick={()=>toggleFavourite(level,f)} className="h-7 w-7 text-yellow-500"><Star className="w-3.5 h-3.5 fill-current"/></Button>
      </div>
    </div>
  ))}</div>;
}

function HistorySection({level}) {
  const { history, clearHistory } = useAppContext();
  const hist = history[level]||[];
  if (!hist.length) return <div className="text-center py-8 text-gray-400"><History className="w-8 h-8 mx-auto mb-2 opacity-30"/><p className="text-sm">No history yet</p></div>;
  return <div><div className="flex justify-end mb-3"><Button size="sm" variant="ghost" onClick={()=>clearHistory(level)} className="text-red-400 hover:text-red-600 gap-1.5 text-xs"><Trash2 className="w-3.5 h-3.5"/>Clear all</Button></div>
    <div className="space-y-2">{hist.map(h=>(
      <div key={h.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl">
        <div><p className="font-semibold text-sm">{h.subject}</p><p className="text-xs text-gray-500">{h.topic}</p><p className="text-[10px] text-gray-400">{new Date(h.searchedAt).toLocaleString()}</p></div>
        <Button size="sm" variant="outline" onClick={()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:h.subject,topic:h.topic,autoSearch:true}}))} className="h-7 text-xs gap-1"><SearchIcon className="w-3 h-3"/>Search again</Button>
      </div>
    ))}</div>
  </div>;
}

export default function ASLevelSuite() {
  const [tab,setTab]=useState('papers');
  const [subjectsTab,setSubjectsTab]=useState('mine');
  const [searchSubject,setSearchSubject]=useState('');
  const handleSearchSubject=useCallback(s=>{setSearchSubject(s.name);setTab('papers');setTimeout(()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:s.name,topic:'',autoSearch:true}})),150);},[]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100">
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,.3) 20px,rgba(255,255,255,.3) 21px)'}}/>
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-white/25 text-xs font-bold px-3 py-1 rounded-full border border-white/20">AS &amp; A-Level</span>
              <span className="bg-orange-500/30 text-orange-100 text-xs px-3 py-1 rounded-full">GCE Advanced Level</span>
              <span className="bg-orange-500/30 text-orange-100 text-xs px-3 py-1 rounded-full">Pre-university</span>
              <span className="bg-orange-500/30 text-orange-100 text-xs px-3 py-1 rounded-full">Age 16–18</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-1">AS &amp; A-Level Suite</h1>
            <p className="text-amber-200 text-base">General Certificate of Education — Advanced Level</p>
          </motion.div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-amber-50 border border-amber-200 p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1 h-auto">
            {[{value:'papers',icon:Brain,label:'Past Papers'},{value:'subjects',icon:Book,label:'My Subjects'},{value:'ai-notes',icon:Sparkles,label:'AI Notes'},{value:'timer',icon:Clock,label:'Timer'}]
              .map(({value,icon:Icon,label})=>(
              <TabsTrigger key={value} value={value} className="flex items-center gap-1.5 text-sm rounded-xl px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-700 data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=inactive]:text-amber-800">
                <Icon className="w-3.5 h-3.5"/><span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="papers"><QuestionSearch examType={LEVEL} subjects={SUBJECTS} initialSubject={searchSubject} accentFrom="from-amber-700" accentTo="to-red-700"/></TabsContent>
          <TabsContent value="subjects">
            <Card className="border-none shadow-xl bg-white/90">
              <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-orange-50 pb-4">
                <CardTitle className="flex items-center gap-2"><Book className="w-5 h-5 text-amber-600"/>My AS &amp; A-Level Subjects</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <Tabs value={subjectsTab} onValueChange={setSubjectsTab}>
                  <TabsList className="mb-4 bg-gray-100 h-9">
                    <TabsTrigger value="mine" className="text-xs data-[state=active]:bg-white">My subjects</TabsTrigger>
                    <TabsTrigger value="favs" className="text-xs data-[state=active]:bg-white flex items-center gap-1"><Star className="w-3 h-3"/>Favourites</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs data-[state=active]:bg-white">History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="mine"><MySubjects level={LEVEL} subjectMap={SUBJECTS} accentClass="from-amber-600 to-red-700" onSearchSubject={handleSearchSubject}/></TabsContent>
                  <TabsContent value="favs"><FavouritesSection level={LEVEL}/></TabsContent>
                  <TabsContent value="history"><HistorySection level={LEVEL}/></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ai-notes"><AINotesGenerator subjects={SUBJECTS} examType={LEVEL}/></TabsContent>
          <TabsContent value="timer"><StudyTimer level={LEVEL}/></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
