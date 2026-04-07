import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, FileText, Brain, Clock, Sparkles,
  Flame, Target, TrendingUp, Star, ChevronRight, GraduationCap,
  Zap, ArrowRight, Trophy, BookMarked, Plus, Play,
  CheckCircle, Award, BarChart2, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExamTimetable from '@/components/ui/exam-timetable';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const LEVELS = [
  { name:'IGCSE',        level:'IGCSE',    path:'/AcademicHub', emoji:'📘', accent:'from-blue-600 to-indigo-700',   ring:'ring-blue-500/30', glow:'shadow-blue-900/30' },
  { name:'AS & A-Level', level:'AS_LEVEL', path:'/ASLevelHub',  emoji:'📙', accent:'from-amber-500 to-orange-600', ring:'ring-amber-500/30', glow:'shadow-amber-900/30' },
  { name:'O-Level',      level:'O_LEVEL',  path:'/OLevelHub',   emoji:'📗', accent:'from-emerald-600 to-teal-600', ring:'ring-emerald-500/30', glow:'shadow-emerald-900/30' },
];

const TIPS = [
  { icon:'💡', text:'Use flashcard mode in AI Notes to quiz yourself after generating notes.' },
  { icon:'⏰', text:'Set your weekly study goal in Settings — the dashboard tracks your progress.' },
  { icon:'⭐', text:'Star any search result to save it in your Favourites tab for quick access.' },
  { icon:'🔊', text:'Select any text on the page and press "Read aloud" to hear it spoken.' },
  { icon:'⌘', text:'Press ⌘K or Ctrl+K to open the command palette and jump anywhere instantly.' },
  { icon:'📥', text:'Save papers to My Downloads for offline access when you have no internet.' },
  { icon:'🤖', text:'AI Notes supports 5 providers — try GPT-4o or Gemini for a different style.' },
  { icon:'📊', text:'The study timer tracks your daily streak — try to keep it alive every day.' },
];

// ── Starfield for logged-out hero ─────────────────────────────────────────────
function Starfield({ count = 50 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id:i, x:Math.random()*100, y:Math.random()*100,
    r:Math.random()*1.8+0.4, op:Math.random()*0.45+0.12,
    dur:Math.random()*7+4, delay:Math.random()*-10,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{left:`${s.x}%`,top:`${s.y}%`,width:s.r,height:s.r,opacity:s.op}}
          animate={{opacity:[s.op,s.op*2.2,s.op]}}
          transition={{duration:s.dur,delay:s.delay,repeat:Infinity,ease:'easeInOut'}}/>
      ))}
    </div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix='' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = Math.max(1, Math.ceil(to / 36));
    const iv = setInterval(() => {
      n = Math.min(n + step, to);
      setVal(n);
      if (n >= to) clearInterval(iv);
    }, 28);
    return () => clearInterval(iv);
  }, [to]);
  return <>{val}{suffix}</>;
}

// ── Mini bar chart ────────────────────────────────────────────────────────────
function BarChart({ days }) {
  const max = Math.max(...days.map(d => d.mins), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {days.map((d, i) => {
        const pct = d.mins / max;
        const h   = Math.max(pct * 52, d.mins > 0 ? 8 : 3);
        const isToday = i === 6;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            {d.mins > 0 && (
              <span className="text-[9px] text-white/40 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {d.mins}m
              </span>
            )}
            <div className="w-full flex items-end" style={{height:52}}>
              <motion.div className={`w-full rounded-t-md ${isToday ? 'bg-gradient-to-t from-blue-600 to-cyan-400' : 'bg-blue-600/35 hover:bg-blue-500/50'} transition-colors cursor-default`}
                style={{height:h}} initial={{height:0}} animate={{height:h}}
                transition={{duration:0.5,delay:i*0.06,ease:'easeOut'}}/>
            </div>
            <span className={`text-[10px] font-semibold ${isToday?'text-cyan-300':'text-white/30'}`}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Level card ────────────────────────────────────────────────────────────────
function LevelCard({ lvl, subjectCount, searchCount, notesCount }) {
  return (
    <motion.div whileHover={{y:-4,scale:1.02}} transition={{duration:0.18}}>
      <Link to={lvl.path}>
        <div className={`relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all cursor-pointer group shadow-lg ${lvl.glow}`}>
          {/* Gradient top strip */}
          <div className={`h-1.5 bg-gradient-to-r ${lvl.accent}`}/>
          <div className="bg-white/[0.04] hover:bg-white/[0.07] transition-colors p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${lvl.accent} flex items-center justify-center text-xl shadow-md ring-4 ${lvl.ring}`}>
                {lvl.emoji}
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full bg-gradient-to-r ${lvl.accent} text-white`}>
                {lvl.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label:'Subjects', value:subjectCount, icon:BookOpen },
                { label:'Searches', value:searchCount,  icon:Search   },
                { label:'Notes',    value:notesCount,   icon:Brain    },
              ].map(({label,value,icon:Icon}) => (
                <div key={label} className="bg-white/[0.05] rounded-xl p-2.5 text-center">
                  <Icon className="w-3.5 h-3.5 mx-auto mb-1 text-white/40"/>
                  <p className="text-lg font-black text-white leading-none">{value}</p>
                  <p className="text-[9px] text-white/35 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors">
              Open Study Hub <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform"/>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, sub, onClick, accent = 'from-blue-600 to-indigo-600', delay = 0 }) {
  return (
    <motion.button initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay}}
      whileHover={{scale:1.03,y:-2}} whileTap={{scale:0.97}}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl bg-gradient-to-br ${accent} border border-white/15 shadow-md hover:shadow-lg transition-all group`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-white"/>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-tight">{label}</p>
          {sub && <p className="text-xs text-white/60 mt-0.5 truncate">{sub}</p>}
        </div>
        <ArrowRight className="w-4 h-4 text-white/50 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0"/>
      </div>
    </motion.button>
  );
}

// ── Rotating tip ──────────────────────────────────────────────────────────────
function StudyTip() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i+1) % TIPS.length), 6000);
    return () => clearInterval(iv);
  }, []);
  const tip = TIPS[idx];
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/25 rounded-2xl border border-indigo-500/20 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-indigo-400"/>
        <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Study tip</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
          className="flex items-start gap-3 min-h-[48px]">
          <span className="text-xl flex-shrink-0">{tip.icon}</span>
          <p className="text-sm text-blue-100/75 leading-relaxed">{tip.text}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-1 mt-4">
        {TIPS.map((_,i) => (
          <button key={i} onClick={()=>setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${i===idx?'bg-indigo-400 w-6':'bg-indigo-600/40 w-1.5 hover:bg-indigo-500/60'}`}/>
        ))}
      </div>
    </div>
  );
}

// ── Streak badge ──────────────────────────────────────────────────────────────
function StreakBadge({ streak }) {
  const fire = streak === 0 ? '❄️' : streak < 3 ? '🌱' : streak < 7 ? '🔥' : streak < 14 ? '🔥🔥' : '⚡';
  const msg  = streak === 0 ? 'No streak yet — study today to start one!'
    : streak === 1 ? 'First day! Keep going tomorrow.'
    : streak < 7  ? `${streak} days and counting — you're building momentum!`
    : streak < 14 ? `${streak} days — on fire! Don't break the chain.`
    : `${streak} days — legendary streak! You're unstoppable.`;
  return (
    <motion.div whileHover={{scale:1.02}} className="flex items-center gap-3 bg-white/[0.05] border border-white/10 rounded-2xl p-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${streak>0?'bg-orange-500/20 ring-2 ring-orange-400/25':'bg-white/5'}`}>
        {fire}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">{streak}</span>
          <span className="text-xs text-white/40 font-semibold">day streak</span>
        </div>
        <p className="text-xs text-white/45 truncate mt-0.5">{msg}</p>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
function Dashboard({ currentUser }) {
  const {
    subjects, history, notesHistory, studyStreak, weeklyMinutes,
    weeklyGoal, last7Days, favourites, examDates,
  } = useAppContext();
  const navigate = useNavigate();

  const allSubjects     = LEVELS.flatMap(l => subjects[l.level] || []);
  const allFavs         = Object.values(favourites).flat().length;
  const goalPct         = Math.min(100, Math.round((weeklyMinutes / weeklyGoal) * 100));
  const activeLevels    = LEVELS.filter(l => (subjects[l.level]||[]).length > 0);
  const recentSearches  = Object.entries(history)
    .flatMap(([lvl, items]) => items.slice(0,2).map(h=>({...h, level:lvl})))
    .slice(0,5);
  const recentNotes     = notesHistory.slice(0,3);
  const upcomingExams   = Object.entries(examDates||{}).flatMap(([lvl,map]) =>
    Object.entries(map||{}).map(([code,iso]) => {
      const days = Math.ceil((new Date(iso)-new Date())/86400000);
      return days >= 0 ? { lvl, code, iso, days } : null;
    }).filter(Boolean)
  ).sort((a,b)=>a.days-b.days).slice(0,1);

  const firstName = (currentUser.name || currentUser.email.split('@')[0]).split(' ')[0];
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6 pb-4">

      {/* ── Welcome hero ── */}
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.04}}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-900 p-6 sm:p-7 text-white">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(255,255,255,1) 23px,rgba(255,255,255,1) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(255,255,255,1) 23px,rgba(255,255,255,1) 24px)'}}/>
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse,rgba(139,92,246,0.35),transparent_70%)] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[radial-gradient(ellipse,rgba(59,130,246,0.25),transparent_70%)] pointer-events-none"/>

        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div>
            <p className="text-blue-300/70 text-xs font-bold uppercase tracking-widest mb-1">{greeting}</p>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              {firstName} <span className="text-blue-300">👋</span>
            </h2>
            <p className="text-blue-200/60 text-sm mt-1">
              {studyStreak > 0 ? `${studyStreak}-day streak — keep it up!` : 'Start your study session today'}
            </p>

            {/* Upcoming exam pill */}
            {upcomingExams.length > 0 && (
              <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:0.3}}
                className="inline-flex items-center gap-1.5 mt-3 bg-red-500/20 border border-red-400/30 text-red-200 text-xs font-bold px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5"/>
                {upcomingExams[0].days === 0 ? 'Exam TODAY!' : `Exam in ${upcomingExams[0].days} day${upcomingExams[0].days>1?'s':''}`}
              </motion.div>
            )}
          </div>

          {/* Stat pills */}
          <div className="flex gap-2.5 flex-wrap sm:flex-nowrap">
            {[
              { icon:Flame,    val:studyStreak, lab:'streak',    hot:studyStreak>0, cls:'bg-orange-500/25 border-orange-400/25' },
              { icon:Target,   val:`${goalPct}%`,lab:'of goal',  hot:goalPct>=100,  cls:'bg-green-500/20 border-green-400/25' },
              { icon:Brain,    val:notesHistory.length, lab:'notes saved', hot:false, cls:'bg-purple-500/20 border-purple-400/20' },
              { icon:Star,     val:allFavs,     lab:'favourites', hot:false, cls:'bg-yellow-500/20 border-yellow-400/20' },
            ].map(({icon:Icon,val,lab,hot,cls}) => (
              <motion.div key={lab} whileHover={{scale:1.07}}
                className={`rounded-2xl px-3.5 py-3 text-center min-w-[68px] border ${cls}`}>
                <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${hot?'text-orange-300':'text-blue-200/70'}`}/>
                <p className="text-lg font-black leading-none">{val}</p>
                <p className="text-[9px] text-blue-200/50 mt-0.5">{lab}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly progress bar */}
        <div className="relative mt-5">
          <div className="flex justify-between text-xs text-blue-200/60 mb-1.5">
            <span className="flex items-center gap-1.5"><BarChart2 className="w-3 h-3"/>{weeklyMinutes} min studied this week</span>
            <span>Goal: {weeklyGoal} min</span>
          </div>
          <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
            <motion.div initial={{width:0}} animate={{width:`${goalPct}%`}} transition={{duration:0.9,ease:'easeOut'}}
              className={`h-full rounded-full ${goalPct>=100?'bg-gradient-to-r from-green-400 to-emerald-500':'bg-gradient-to-r from-blue-400 to-cyan-400'}`}/>
          </div>
          {goalPct >= 100 && (
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9}}
              className="text-xs text-green-300 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5"/>Weekly goal reached! 🎉
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Quick actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={Search}  label="Search Papers" sub="Find past questions" onClick={()=>navigate(activeLevels[0]?.path||'/AcademicHub')} accent="from-blue-600 to-indigo-700" delay={0.12}/>
          <QuickAction icon={Brain}   label="AI Notes"      sub="Generate study notes" onClick={()=>navigate(activeLevels[0]?.path||'/AcademicHub')} accent="from-purple-600 to-indigo-700" delay={0.16}/>
          <QuickAction icon={Play}    label="Study Timer"   sub="Start a session"     onClick={()=>navigate(activeLevels[0]?.path||'/AcademicHub')} accent="from-emerald-600 to-teal-700" delay={0.20}/>
          <QuickAction icon={Plus}    label="Add Subject"   sub="Manage your subjects" onClick={()=>navigate(activeLevels[0]?.path||'/AcademicHub')} accent="from-amber-500 to-orange-600" delay={0.24}/>
        </div>
      </motion.div>

      {/* ── Study hubs + activity chart ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Activity chart */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.14}}
          className="lg:col-span-2 bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400"/>7-day activity
              </p>
              <p className="text-xs text-white/35 mt-0.5">{weeklyMinutes} min studied this week</p>
            </div>
            <StreakBadge streak={studyStreak}/>
          </div>
          <BarChart days={last7Days}/>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.18}}>
          <StudyTip/>
        </motion.div>
      </div>

      {/* ── Level hubs ── */}
      {activeLevels.length > 0 ? (
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white/60 uppercase tracking-wider">Your Study Hubs</p>
            <span className="text-xs text-white/30">{allSubjects.length} subject{allSubjects.length!==1?'s':''} total</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {activeLevels.map(lvl => (
              <LevelCard key={lvl.level} lvl={lvl}
                subjectCount={(subjects[lvl.level]||[]).length}
                searchCount={(history[lvl.level]||[]).length}
                notesCount={notesHistory.filter(n=>n.examType===lvl.level).length}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        /* First-time user: choose a hub */
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          className="rounded-3xl overflow-hidden border border-white/10">
          <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/30 px-6 py-5 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-blue-400"/>
              <h3 className="font-bold text-white text-base">Choose your Cambridge level</h3>
            </div>
            <p className="text-blue-200/50 text-sm">Pick a Study Hub to add subjects and start searching for past papers.</p>
          </div>
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07]">
            {LEVELS.map((lvl, i) => (
              <Link key={lvl.level} to={lvl.path}>
                <motion.div whileHover={{backgroundColor:'rgba(255,255,255,0.06)'}}
                  className="flex flex-col items-center gap-3 p-6 text-center cursor-pointer transition-colors">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lvl.accent} flex items-center justify-center text-2xl shadow-lg`}>
                    {lvl.emoji}
                  </div>
                  <div>
                    <p className="font-black text-white">{lvl.name}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {['IGCSE','AS_LEVEL','O_LEVEL'][i]==='IGCSE'?'50+ subjects':['AS_LEVEL'][0]?'40+ subjects':'35+ subjects'}
                    </p>
                  </div>
                  <Button size="sm" className={`bg-gradient-to-r ${lvl.accent} text-white rounded-xl px-5 shadow-md text-xs`}>
                    Open Hub <ArrowRight className="w-3.5 h-3.5 ml-1"/>
                  </Button>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Two-column: recent activity + notes ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.24}}
            className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400"/>Recent searches
              </p>
              <span className="text-xs text-white/30">{recentSearches.length} recent</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {recentSearches.map(h => {
                const lvl  = LEVELS.find(l=>l.level===h.level);
                const path = lvl?.path || '/AcademicHub';
                return (
                  <Link key={h.id} to={path}>
                    <motion.div whileHover={{backgroundColor:'rgba(255,255,255,0.04)'}}
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${lvl?.accent||'from-blue-600 to-indigo-700'} flex items-center justify-center text-sm flex-shrink-0`}>
                        {lvl?.emoji||'📄'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white/80 truncate">{h.subject}</p>
                        {h.topic && <p className="text-xs text-white/35 truncate">{h.topic}</p>}
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0"/>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recent AI notes */}
        {recentNotes.length > 0 && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.27}}
            className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07]">
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400"/>Recent notes
              </p>
              <span className="text-xs text-white/30">{notesHistory.length} saved</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {recentNotes.map(n => (
                <div key={n.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-3.5 h-3.5 text-purple-400"/>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white/80 truncate">{n.subject}</p>
                    <p className="text-xs text-white/35 truncate">{n.topic}</p>
                  </div>
                  <span className="text-[9px] text-white/25 bg-white/[0.05] px-1.5 py-0.5 rounded-md flex-shrink-0">
                    {n.examType}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
          className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 md:col-span-2">
          <p className="font-bold text-white text-sm flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400"/>Achievements
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { emoji:'📚', title:'First search',    done:Object.values(history).flat().length>0, sub:'Search for any topic' },
              { emoji:'🤖', title:'First AI note',   done:notesHistory.length>0,  sub:'Generate study notes' },
              { emoji:'⭐', title:'First favourite', done:Object.values(favourites).flat().length>0, sub:'Star any result' },
              { emoji:'🔥', title:'3-day streak',    done:studyStreak>=3, sub:'Study 3 days in a row' },
            ].map(({emoji,title,done,sub}) => (
              <motion.div key={title} whileHover={{scale:1.04}}
                className={`rounded-xl p-3 border transition-all ${done?'bg-yellow-500/12 border-yellow-400/25':'bg-white/[0.03] border-white/[0.07] opacity-50'}`}>
                <span className={`text-2xl block mb-2 ${done?'':'grayscale'}`}>{emoji}</span>
                <p className={`text-xs font-bold ${done?'text-yellow-300':'text-white/40'}`}>{title}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>
                {done && <CheckCircle className="w-3.5 h-3.5 text-yellow-400 mt-1.5"/>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Exam timetable */}
      <ExamTimetable/>
    </motion.div>
  );
}

// ── Logged-out hero ───────────────────────────────────────────────────────────
function Hero() {
  const words = ['IGCSE','AS Level','A Level','O Level','Cambridge'];
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText]       = useState('');
  const [del,  setDel]        = useState(false);

  useEffect(() => {
    const word = words[wordIdx % words.length];
    let t;
    if (!del && text === word) { t = setTimeout(() => setDel(true), 2200); }
    else if (del && text === '') { setDel(false); setWordIdx(i=>i+1); }
    else { t = setTimeout(() => setText(p => del ? p.slice(0,-1) : word.slice(0,p.length+1)), del ? 40 : 75); }
    return () => clearTimeout(t);
  }, [text, del, wordIdx]);

  return (
    <div className="min-h-screen bg-[#05071a] relative overflow-hidden">
      <Starfield count={70}/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(59,130,246,0.15),transparent_50%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_70%,rgba(139,92,246,0.12),transparent_50%)]"/>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}
          className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5"/>Cambridge exam prep, reimagined
        </motion.div>

        <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.7}}
          className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
          Ace your{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent inline-block min-w-[220px] text-left">
            {text}<span className="animate-pulse">|</span>
          </span>
          <br/>exams
        </motion.h1>

        <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
          className="text-blue-200/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Real Cambridge past papers, AI-generated study notes, a built-in study timer, and mark schemes — all in one place.
        </motion.p>

        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
          className="flex flex-wrap gap-3 justify-center mb-16">
          <Link to="/signup">
            <Button className="h-13 px-8 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl shadow-xl shadow-blue-900/40 gap-2">
              Get started free <ArrowRight className="w-4 h-4"/>
            </Button>
          </Link>
          <Link to="/AcademicHub">
            <Button variant="outline" className="h-13 px-8 text-base font-semibold border-white/20 text-white hover:bg-white/10 rounded-2xl gap-2">
              Browse papers <ChevronRight className="w-4 h-4"/>
            </Button>
          </Link>
        </motion.div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 text-left">
          {[
            { icon:'📄', title:'Real past papers',     desc:'Actual Cambridge PDFs, papers 1 through 6, core and extended.',  accent:'from-blue-600 to-indigo-700' },
            { icon:'🤖', title:'AI study notes',       desc:'Five AI providers, human-tone explanations, diagrams, flashcards.',accent:'from-purple-600 to-indigo-700' },
            { icon:'⏱',  title:'Smart study tools',    desc:'Pomodoro timer, weekly goals, streak counter, activity chart.',   accent:'from-emerald-600 to-teal-700' },
          ].map(({icon,title,desc,accent},i) => (
            <motion.div key={title} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.5+i*0.1}}
              className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-colors">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-xl mb-3 shadow-md`}>{icon}</div>
              <h3 className="font-bold text-white mb-1">{title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9}}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/35 text-sm">
          {['53 IGCSE subjects','39 AS & A-Level subjects','40 O-Level subjects','5 AI providers','7 languages'].map(s=>(
            <span key={s} className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-400/70"/>{s}</span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { isLoggedIn, currentUser } = useAppContext();

  if (!isLoggedIn || !currentUser) return <Hero/>;

  return (
    <div className="min-h-screen bg-[#05071a]">
      {/* Cosmic background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(59,130,246,0.08),transparent_45%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgba(139,92,246,0.06),transparent_45%)]"/>
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Dashboard currentUser={currentUser}/>
      </div>
    </div>
  );
}
