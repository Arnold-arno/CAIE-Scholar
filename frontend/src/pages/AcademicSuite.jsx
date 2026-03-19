import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const API   = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const LEVEL = 'IGCSE';

const IGCSE_SUBJECTS = {
  'Accounting':'0452','Agriculture':'0600','Art & Design':'0400','Biology':'0610',
  'Business Studies':'0450','Chemistry':'0620','Computer Science':'0478',
  'Co-ordinated Sciences':'0654','Design & Technology':'0445','Economics':'0455',
  'English - First Language':'0500','English - Second Language':'0510',
  'English - Literature':'0486','Enterprise':'0454','Environmental Management':'0680',
  'Food & Nutrition':'0648','French - Foreign Language':'0520','Geography':'0460',
  'German - Foreign Language':'0525','Global Perspectives':'0457','History':'0470',
  'ICT':'0417','Islamic Studies':'0493','Mathematics':'0580',
  'Mathematics - Additional':'0606','Mathematics - International':'0607','Music':'0410',
  'Physical Education':'0413','Physics':'0625','Religious Studies':'0490',
  'Science - Combined':'0653','Sociology':'0495','Spanish - Foreign Language':'0530',
  'Travel & Tourism':'0471','World Literature':'0408',
};

// Favourites panel — inside My Subjects tab
function FavouritesSection({ level, accentHover }) {
  const { favourites, toggleFavourite } = useAppContext();
  const favs = favourites[level] || [];
  if (favs.length === 0)
    return (
      <div className="text-center py-8 text-gray-400">
        <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No favourites yet — star a paper result to save it here</p>
      </div>
    );
  return (
    <div className="space-y-2">
      {favs.map(f => (
        <div key={f.id} className={`flex items-center justify-between p-3.5 bg-white border border-gray-200 hover:${accentHover} rounded-xl transition-all`}>
          <div>
            <p className="font-semibold text-sm text-gray-900">{f.subject}</p>
            <p className="text-xs text-gray-500 mt-0.5">{f.topic}</p>
          </div>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:f.subject,topic:f.topic,autoSearch:true}}))}
              className="h-7 text-xs gap-1">
              <SearchIcon className="w-3 h-3"/>Search again
            </Button>
            <Button size="icon" variant="ghost" onClick={() => toggleFavourite(level, f)}
              className="h-7 w-7 text-yellow-500 hover:text-yellow-700">
              <Star className="w-3.5 h-3.5 fill-current"/>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistorySection({ level }) {
  const { history, clearHistory } = useAppContext();
  const hist = history[level] || [];
  if (hist.length === 0)
    return <div className="text-center py-8 text-gray-400"><History className="w-8 h-8 mx-auto mb-2 opacity-30"/><p className="text-sm">No search history yet</p></div>;
  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button size="sm" variant="ghost" onClick={() => clearHistory(level)} className="text-red-400 hover:text-red-600 gap-1.5 text-xs"><Trash2 className="w-3.5 h-3.5"/>Clear all</Button>
      </div>
      <div className="space-y-2">
        {hist.map(h => (
          <div key={h.id} className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl">
            <div>
              <p className="font-semibold text-sm">{h.subject}</p>
              <p className="text-xs text-gray-500">{h.topic}</p>
              <p className="text-[10px] text-gray-400">{new Date(h.searchedAt).toLocaleString()}</p>
            </div>
            <Button size="sm" variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:h.subject,topic:h.topic,autoSearch:true}}))}
              className="h-7 text-xs gap-1">
              <SearchIcon className="w-3 h-3"/>Search again
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AcademicSuite() {
  const [tab, setTab]             = useState('papers');
  const [subjectsTab, setSubjectsTab] = useState('mine');
  const [searchSubject, setSearchSubject] = useState('');

  const { data: health } = useQuery({
    queryKey:['backendHealth'],
    queryFn: async()=>{ try{const r=await fetch(`${API}/api/health`);return r.ok?r.json():null;}catch{return null;} },
    refetchInterval:30000,retry:false,
  });

  const handleSearchSubject = useCallback((s) => {
    setSearchSubject(s.name); setTab('papers');
    setTimeout(()=>window.dispatchEvent(new CustomEvent('searchAgain',{detail:{subject:s.name,topic:'',autoSearch:true}})),150);
  },[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,.3) 39px,rgba(255,255,255,.3) 40px)'}}/>
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-white/25 text-xs font-bold px-3 py-1 rounded-full border border-white/20">IGCSE</span>
              <span className="bg-blue-500/30 text-blue-100 text-xs px-3 py-1 rounded-full">O-Level equivalent</span>
              <span className="bg-blue-500/30 text-blue-100 text-xs px-3 py-1 rounded-full">Age 14–16</span>
              {health&&<span className="bg-green-400/20 text-green-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border border-green-400/20"><span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"/>{health.local_papers} papers cached</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-1">IGCSE Suite</h1>
            <p className="text-blue-200 text-base">International General Certificate of Secondary Education</p>
          </motion.div>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400"/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="bg-blue-50 border border-blue-200 p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1 h-auto">
            {[
              {value:'papers',  icon:Brain,    label:'Past Papers'},
              {value:'subjects',icon:Book,     label:'My Subjects'},
              {value:'ai-notes',icon:Sparkles, label:'AI Notes'},
              {value:'timer',   icon:Clock,    label:'Timer'},
            ].map(({value,icon:Icon,label})=>(
              <TabsTrigger key={value} value={value}
                className="flex items-center gap-1.5 text-sm rounded-xl px-4 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=inactive]:text-blue-700">
                <Icon className="w-3.5 h-3.5"/><span className="hidden sm:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="papers">
            <QuestionSearch examType={LEVEL} subjects={IGCSE_SUBJECTS} initialSubject={searchSubject} accentFrom="from-blue-700" accentTo="to-indigo-700"/>
          </TabsContent>

          <TabsContent value="subjects">
            <Card className="border-none shadow-xl bg-white/90">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                <CardTitle className="flex items-center gap-2"><Book className="w-5 h-5 text-blue-600"/>My IGCSE Subjects</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Search icon = search papers · Star = saved favourites · History = recent searches</p>
              </CardHeader>
              <CardContent className="p-5">
                <Tabs value={subjectsTab} onValueChange={setSubjectsTab}>
                  <TabsList className="mb-4 bg-gray-100 h-9">
                    <TabsTrigger value="mine" className="text-xs data-[state=active]:bg-white">My subjects</TabsTrigger>
                    <TabsTrigger value="favs" className="text-xs data-[state=active]:bg-white flex items-center gap-1"><Star className="w-3 h-3"/>Favourites</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs data-[state=active]:bg-white">Search history</TabsTrigger>
                  </TabsList>
                  <TabsContent value="mine">
                    <MySubjects level={LEVEL} subjectMap={IGCSE_SUBJECTS} accentClass="from-blue-600 to-indigo-700" onSearchSubject={handleSearchSubject}/>
                  </TabsContent>
                  <TabsContent value="favs">
                    <FavouritesSection level={LEVEL} accentHover="border-blue-300"/>
                  </TabsContent>
                  <TabsContent value="history">
                    <HistorySection level={LEVEL}/>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-notes"><AINotesGenerator subjects={IGCSE_SUBJECTS} examType={LEVEL}/></TabsContent>
          <TabsContent value="timer"><StudyTimer level={LEVEL}/></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
