import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, FileText, CheckCircle, Brain, Clock,
  Sparkles, Award, Flame, Target, TrendingUp, Star, ChevronRight,
  GraduationCap, Zap, ArrowRight, Users, Trophy, BookMarked, Volume2,
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import ExamTimetable from '@/components/ui/exam-timetable';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const LEVELS = [
  {
    name: 'IGCSE',
    fullName: 'International General Certificate of Secondary Education',
    aliases: ['O-Level equivalent', '40+ subjects'],
    path: '/AcademicHub',
    description: 'The most widely recognised secondary qualification worldwide',
    gradientCard: 'from-blue-50 to-indigo-50',
    gradientActive: 'from-blue-600 to-indigo-700',
    accent: 'from-blue-500 to-indigo-500',
    border: 'border-blue-200',
    borderHover: 'hover:border-blue-400',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    glow: 'shadow-blue-200',
    icon: Search,
    level: 'IGCSE',
    emoji: '📘',
    features: ['Search 40+ IGCSE subjects', 'Real Cambridge PDFs', 'Mark scheme preview'],
  },
  {
    name: 'AS & A-Level',
    fullName: 'General Certificate of Education — Advanced Level',
    aliases: ['GCE Advanced Level', 'Pre-university'],
    path: '/ASLevelHub',
    description: 'The standard for UK university entry and international higher education',
    gradientCard: 'from-amber-50 to-orange-50',
    gradientActive: 'from-amber-600 to-red-600',
    accent: 'from-amber-500 to-red-500',
    border: 'border-amber-200',
    borderHover: 'hover:border-amber-400',
    iconBg: 'bg-gradient-to-br from-amber-600 to-red-600',
    glow: 'shadow-amber-200',
    icon: BookOpen,
    level: 'AS_LEVEL',
    emoji: '📙',
    features: ['AS Level + A2 papers', 'Detailed mark schemes', 'AI study notes'],
  },
  {
    name: 'O-Level',
    fullName: 'General Certificate of Education — Ordinary Level',
    aliases: ['Cambridge O Level', 'Parallel to IGCSE'],
    path: '/OLevelHub',
    description: 'Taken across South Asia, East Africa, the Middle East and beyond',
    gradientCard: 'from-emerald-50 to-teal-50',
    gradientActive: 'from-emerald-700 to-teal-700',
    accent: 'from-emerald-500 to-teal-500',
    border: 'border-emerald-200',
    borderHover: 'hover:border-emerald-400',
    iconBg: 'bg-gradient-to-br from-emerald-700 to-teal-700',
    glow: 'shadow-emerald-200',
    icon: FileText,
    level: 'O_LEVEL',
    emoji: '📗',
    features: ['Cambridge O Level papers', 'Core subject coverage', 'Study timer included'],
  },
];

const FEATURES = [
  { icon: Search,   title: 'Real past papers',    desc: 'Actual Cambridge PDFs from PapaCambridge — not AI-generated questions', colour: 'blue' },
  { icon: Brain,    title: 'AI study notes',      desc: 'Human-like notes with inline diagrams, PDF export and flashcard self-test', colour: 'purple' },
  { icon: Clock,    title: 'Study timer',         desc: 'Pomodoro timer with weekly goal, streak counter and 7-day activity chart', colour: 'green' },
  { icon: Sparkles, title: 'Split mark schemes',  desc: 'View question paper and mark scheme side by side, download together', colour: 'amber' },
  { icon: Volume2,  title: 'Read aloud',          desc: 'Select any text on the page and have it read aloud with adjustable speed', colour: 'teal' },
  { icon: BookMarked, title: 'Notes history',     desc: 'Every AI notes session is saved and can be restored in one click', colour: 'indigo' },
];

const TIPS = [
  '💡 Use the flashcard mode in AI Notes to quiz yourself on practice questions.',
  '⏰ Set your weekly study goal in Settings to track progress on the dashboard.',
  '⭐ Star search results to save them in your Favourites tab.',
  '🔊 Select any text and press "Read aloud" to have it spoken to you.',
  '⌘K opens the command palette — navigate anywhere in two keystrokes.',
  '📥 Save papers to "My Downloads" and access them offline anytime.',
];

// Typewriter hook
function useTypewriter(words, speed = 80, pause = 2000) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wordIdx % words.length];
    let timeout;
    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      setDeleting(false);
      setWordIdx(i => i + 1);
    } else {
      timeout = setTimeout(() => {
        setText(prev => deleting ? prev.slice(0, -1) : word.slice(0, prev.length + 1));
      }, deleting ? speed / 2 : speed);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words, speed, pause]);
  return text;
}

// Floating particles background
function Particles({ count = 60 }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * -20,
  })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -30, 0], opacity: [p.opacity, p.opacity * 1.5, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Stat counter with animation
function StatCounter({ value, label, icon: Icon, suffix = '' }) {
  const [count, setCount] = useState(0);
  const num = parseInt(value) || 0;
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setCount(start);
      if (start >= num) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [num]);
  return (
    <div className="text-center">
      <Icon className="w-5 h-5 mx-auto mb-2 text-blue-300" />
      <p className="text-3xl font-extrabold text-white">{count}{suffix}</p>
      <p className="text-blue-300 text-sm">{label}</p>
    </div>
  );
}

// Dashboard for logged-in users — rich version
function Dashboard({ currentUser }) {
  const {
    subjects, history, notesHistory, studyStreak, weeklyMinutes, weeklyGoal,
    last7Days, favourites,
  } = useAppContext();
  const navigate = useNavigate();

  const allFavCount    = Object.values(favourites).flat().length;
  const goalPct        = Math.min(100, Math.round(weeklyMinutes / weeklyGoal * 100));
  const maxMins        = Math.max(...last7Days.map(d => d.mins), 1);
  const activeLevels   = LEVELS.filter(l => (subjects[l.level] || []).length > 0);
  const recentSearches = Object.entries(history)
    .flatMap(([lvl, items]) => items.slice(0, 3).map(h => ({ ...h, level: lvl })))
    .slice(0, 6);

  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(iv);
  }, []);

  // Streak message
  const streakMsg = studyStreak === 0 ? 'Start your streak today!'
    : studyStreak < 3  ? 'Keep it up!'
    : studyStreak < 7  ? '🔥 You\'re on fire!'
    : studyStreak < 14 ? '🔥🔥 Incredible streak!'
    : '🔥🔥🔥 Legendary streak!';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* Welcome + stats bar */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
        className="relative bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 rounded-3xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)',backgroundSize:'24px 24px'}}/>
        <div className="relative flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase mb-1">Welcome back</p>
            <h2 className="text-2xl md:text-3xl font-extrabold">{currentUser.name || currentUser.email.split('@')[0]}</h2>
            <p className="text-blue-200 text-sm mt-1">{streakMsg}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { icon: Flame,  label: 'Day streak',   value: studyStreak, highlight: studyStreak > 0 },
              { icon: Target, label: 'Weekly goal',  value: `${goalPct}%` },
              { icon: Brain,  label: 'Notes saved',  value: notesHistory.length },
              { icon: Star,   label: 'Favourites',   value: allFavCount },
            ].map(({ icon: Icon, label, value, highlight }) => (
              <motion.div key={label} whileHover={{ scale: 1.06 }}
                className={`rounded-2xl px-4 py-3 text-center min-w-[76px] cursor-default ${highlight ? 'bg-orange-500/30 border border-orange-400/30' : 'bg-white/15'}`}>
                <Icon className={`w-4 h-4 mx-auto mb-1 ${highlight ? 'text-orange-300' : 'text-blue-200'}`} />
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-[10px] text-blue-200 mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Goal bar */}
        <div className="relative mt-5">
          <div className="flex justify-between text-xs text-blue-200 mb-1.5">
            <span>Weekly progress — {weeklyMinutes} min studied</span>
            <span>Goal: {weeklyGoal} min</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${goalPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${goalPct >= 100 ? 'bg-green-400' : 'bg-blue-300'}`} />
          </div>
        </div>
      </motion.div>

      {/* 7-day chart + tips */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Activity chart */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="md:col-span-2 bg-white/6 rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500"/>Last 7 days
            </p>
            <span className="text-xs text-gray-400">{weeklyMinutes} min this week</span>
          </div>
          <div className="flex items-end gap-2" style={{ height: 72 }}>
            {last7Days.map((d, i) => {
              const pct    = d.mins / maxMins;
              const height = Math.max(pct * 64, d.mins > 0 ? 8 : 3);
              const isToday = i === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  {d.mins > 0 && <span className="text-[9px] text-gray-400 font-medium">{d.mins}m</span>}
                  <div className="w-full flex items-end" style={{ height: 64 }}>
                    <motion.div
                      className={`w-full rounded-t-md ${isToday ? 'bg-gradient-to-t from-blue-500 to-cyan-400' : 'bg-blue-600/40'}`}
                      style={{ height }}
                      initial={{ height: 0 }} animate={{ height }} transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${isToday ? 'text-cyan-300' : 'text-blue-400/60'}`}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tips carousel */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
          className="bg-gradient-to-br from-indigo-900/30 to-purple-900/20 rounded-2xl border border-indigo-500/20 p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-indigo-500"/>
            <p className="text-sm font-bold text-indigo-300">Study tip</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={tipIdx} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              className="text-sm text-blue-100/80 leading-relaxed flex-1">
              {TIPS[tipIdx]}
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-1 mt-4">
            {TIPS.map((_, i) => (
              <button key={i} onClick={() => setTipIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === tipIdx ? 'bg-indigo-500 w-5' : 'bg-indigo-200 dark:bg-indigo-800 w-1.5'}`}/>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Active level cards */}
      {activeLevels.length > 0 && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
          <p className="text-base font-bold text-white/80 mb-3">Your Study Hubs</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {activeLevels.map((l, i) => {
              const count = (subjects[l.level] || []).length;
              const hist  = (history[l.level]  || []).length;
              return (
                <motion.div key={l.level} whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}>
                  <Link to={l.path}>
                    <div className="p-5 rounded-2xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/8 backdrop-blur-sm transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{l.emoji}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${l.accent}`}>
                          {l.name}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-blue-200/70">
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/>{count} subjects</span>
                        <span className="flex items-center gap-1"><Search className="w-3.5 h-3.5"/>{hist} searches</span>
                      </div>
                      <div className="mt-3 flex items-center text-xs font-semibold text-blue-300/70 group">
                        Open Study Hub <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform"/>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}>
          <p className="text-base font-bold text-white/80 mb-3">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(h => {
              const hubPath = h.level === 'IGCSE' ? '/AcademicHub' : h.level === 'AS_LEVEL' ? '/ASLevelHub' : '/OLevelHub';
              return (
                <motion.div key={h.id} whileHover={{ scale: 1.04 }}>
                  <Link to={hubPath}>
                    <span className="flex items-center gap-1.5 text-sm bg-white/8 border border-white/10 hover:border-blue-400/50 hover:bg-blue-500/15 text-blue-200 hover:text-blue-100 rounded-xl px-3.5 py-2 transition-all">
                      <Search className="w-3.5 h-3.5 flex-shrink-0"/>
                      <span className="font-medium">{h.subject}</span>
                      {h.topic && h.topic !== `All papers — ${h.subject}` && (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">· {h.topic.slice(0, 20)}</span>
                      )}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <ExamTimetable />

      {/* Quick actions for new users with no active levels */}
      {activeLevels.length === 0 && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="bg-gradient-to-r from-blue-900/30 to-indigo-900/20 rounded-2xl border border-blue-500/20 p-6 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-blue-400 mb-3"/>
          <h3 className="font-bold text-white text-lg mb-1">Choose your Cambridge level</h3>
          <p className="text-blue-200/70 text-sm mb-5">Pick a Study Hub below to add subjects and start searching for papers.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {LEVELS.map(l => (
              <Link key={l.level} to={l.path}>
                <Button className={`bg-gradient-to-r ${l.gradientActive} text-white rounded-xl gap-2 shadow-md`}>
                  {l.emoji} {l.name}
                </Button>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Home() {
  const { isLoggedIn, currentUser } = useAppContext();
  const typeText = useTypewriter(['past papers.', 'AI study notes.', 'mark schemes.', 'timed sessions.', 'exam success.']);

  return (
    <div className="min-h-screen bg-[#05071a]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#05071a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_60%,rgba(59,130,246,0.22),transparent_55%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_25%,rgba(220,38,38,0.14),transparent_50%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,rgba(99,102,241,0.12),transparent_60%)]"/>
          <Particles count={70}/>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7, ease:'easeOut' }}>
              <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-blue-200 text-sm font-semibold border border-white/15">
                <Award className="w-4 h-4"/>Cambridge Assessment International Education
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black text-white mb-3 leading-none tracking-tight">
                <span className="text-blue-400">CAIE</span>
                <span className="text-red-400 ml-3">Scholar</span>
              </h1>

              <p className="text-blue-300 text-xs mb-4 tracking-widest uppercase font-semibold">
                Your Cambridge exam companion
              </p>

              {/* Typewriter */}
              <p className="text-xl text-blue-100/80 mb-8 leading-relaxed">
                Find your{' '}
                <span className="text-blue-300 font-bold border-b-2 border-blue-400 border-dashed">
                  {typeText}<span className="animate-pulse">|</span>
                </span>
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/AcademicHub">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold h-13 px-8 shadow-2xl shadow-blue-500/40 rounded-xl text-base gap-2">
                    <Search className="w-5 h-5"/>Search Papers
                  </Button>
                </Link>
                {!isLoggedIn && (
                  <Link to="/signup">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-13 px-8 rounded-xl text-base gap-2 font-semibold">
                      Get started free <ArrowRight className="w-4 h-4"/>
                    </Button>
                  </Link>
                )}
              </div>

              {/* Quick stats */}
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
                <StatCounter value={40} label="IGCSE subjects" icon={GraduationCap} suffix="+"/>
                <StatCounter value={15} label="Years of papers" icon={Clock} suffix="+"/>
                <StatCounter value={3}  label="Exam levels" icon={Trophy}/>
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, scale:0.75, rotate:-5 }} animate={{ opacity:1, scale:1, rotate:0 }}
              transition={{ duration:0.9, ease:'easeOut', delay:0.15 }} className="flex justify-center">
              <motion.img src="/logo.png" alt="CAIE Scholar"
                className="w-full max-w-xs md:max-w-sm drop-shadow-2xl"
                style={{ filter:'drop-shadow(0 0 80px rgba(59,130,246,0.55))' }}
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12 bg-[#05071a]">
        {isLoggedIn && currentUser ? (
          <Dashboard currentUser={currentUser} />
        ) : (
          <>
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="text-center mb-10 pt-4">
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-3">Choose your Study Hub</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
                Each Cambridge qualification has its own hub — colour-coded, fully featured, and ready to use.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {LEVELS.map(({ name, fullName, aliases, path, description, gradientCard, accent, borderHover, iconBg, glow, icon: Icon, emoji, features }, i) => (
                <motion.div key={name} initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }} className="cursor-pointer">
                  <Link to={path}>
                    <Card className={`border border-white/10 hover:border-white/25 shadow-2xl hover:shadow-none transition-all duration-300 bg-white/5 backdrop-blur-sm h-full`}>
                      <div className={`h-2 bg-gradient-to-r ${accent} rounded-t-xl`}/>
                      <CardContent className="p-7">
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <Icon className="w-7 h-7 text-white"/>
                          </div>
                          <span className="text-3xl">{emoji}</span>
                        </div>
                        <h3 className="text-2xl font-extrabold mb-1 text-white">{name}</h3>
                        <p className="text-xs text-blue-300/70 font-medium mb-3">{fullName}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {aliases.map(a => (
                            <span key={a} className="text-[11px] bg-white/10 border border-white/20 text-blue-200 px-2.5 py-0.5 rounded-full font-semibold">{a}</span>
                          ))}
                        </div>
                        <p className="text-blue-200/70 text-sm mb-5 leading-relaxed">{description}</p>
                        <ul className="space-y-2.5">
                          {features.map(f => (
                            <li key={f} className="flex items-center gap-2.5 text-sm text-blue-100/80">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0"/>{f}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-5 flex items-center text-sm font-bold text-blue-300 group">
                          Open Study Hub <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"/>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <div className="bg-[#06091f] py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-2">Everything you need to succeed</h2>
            <p className="text-blue-300/70">Built specifically for Cambridge students — not a generic study app</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, colour }, i) => (
              <motion.div key={title} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i * 0.07 }}
                whileHover={{ y:-3 }}
                className="p-6 rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/8 backdrop-blur-sm hover:shadow-2xl transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border"
                    style={{
                      background: {'blue':'rgba(59,130,246,0.15)','purple':'rgba(139,92,246,0.15)','green':'rgba(34,197,94,0.15)','amber':'rgba(245,158,11,0.15)','teal':'rgba(20,184,166,0.15)','indigo':'rgba(99,102,241,0.15)'}[colour],
                      borderColor: {'blue':'rgba(59,130,246,0.3)','purple':'rgba(139,92,246,0.3)','green':'rgba(34,197,94,0.3)','amber':'rgba(245,158,11,0.3)','teal':'rgba(20,184,166,0.3)','indigo':'rgba(99,102,241,0.3)'}[colour],
                    }}>
                  <Icon className="w-6 h-6" style={{color: {'blue':'#93c5fd','purple':'#c4b5fd','green':'#86efac','amber':'#fcd34d','teal':'#5eead4','indigo':'#a5b4fc'}[colour]}}/>
                </div>
                <h4 className="font-bold text-white mb-1.5 text-base">{title}</h4>
                <p className="text-sm text-blue-200/60 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA strip ────────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 py-16">
          <div className="max-w-2xl mx-auto text-center px-6">
            <h2 className="text-3xl font-extrabold text-white mb-3">Ready to study smarter?</h2>
            <p className="text-blue-200 mb-8">Join CAIE Scholar — free, no credit card, no ads.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold h-13 px-10 rounded-xl shadow-xl text-base gap-2">
                  Create free account <ArrowRight className="w-4 h-4"/>
                </Button>
              </Link>
              <Link to="/AcademicHub">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-13 px-10 rounded-xl font-semibold text-base">
                  Browse papers first
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
