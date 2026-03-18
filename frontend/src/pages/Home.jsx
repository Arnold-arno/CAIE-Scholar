import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, BookOpen, FileText, CheckCircle, Brain, Clock,
  Sparkles, Award, Flame, Target, TrendingUp, Star, ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const LEVELS = [
  {
    name: 'IGCSE',
    fullName: 'International General Certificate of Secondary Education',
    aliases: ['O-Level equivalent', 'Ages 14–16', '40+ subjects'],
    path: '/AcademicSuite',
    description: 'The most widely recognised secondary qualification worldwide',
    gradientCard: 'from-blue-50 to-indigo-50',
    accent: 'from-blue-500 to-indigo-500',
    borderHover: 'hover:border-blue-400',
    iconBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    icon: Search,
    level: 'IGCSE',
    features: ['Search 40+ IGCSE subjects', 'Real Cambridge PDFs', 'Mark scheme preview'],
  },
  {
    name: 'AS & A-Level',
    fullName: 'General Certificate of Education — Advanced Level',
    aliases: ['GCE Advanced Level', 'Pre-university', 'Ages 16–18'],
    path: '/ASLevelSuite',
    description: 'The standard for UK university entry and international higher education',
    gradientCard: 'from-amber-50 to-orange-50',
    accent: 'from-amber-500 to-red-500',
    borderHover: 'hover:border-amber-400',
    iconBg: 'bg-gradient-to-r from-amber-600 to-red-600',
    icon: BookOpen,
    level: 'AS_LEVEL',
    features: ['AS Level + A2 papers', 'Detailed mark schemes', 'AI study notes'],
  },
  {
    name: 'O-Level',
    fullName: 'General Certificate of Education — Ordinary Level',
    aliases: ['Cambridge O Level', 'Parallel to IGCSE', 'Ages 14–16'],
    path: '/OLevelSuite',
    description: 'Taken across South Asia, East Africa, the Middle East and beyond',
    gradientCard: 'from-emerald-50 to-teal-50',
    accent: 'from-emerald-500 to-teal-500',
    borderHover: 'hover:border-emerald-400',
    iconBg: 'bg-gradient-to-r from-emerald-700 to-teal-700',
    icon: FileText,
    level: 'O_LEVEL',
    features: ['Cambridge O Level papers', 'Core subject coverage', 'Study timer included'],
  },
];

const FEATURES = [
  { icon: Search,   title: 'Real past papers',  desc: 'Actual Cambridge PDFs from PapaCambridge and GCE Guide' },
  { icon: Brain,    title: 'AI study notes',    desc: 'Human-like prose notes with inline diagrams, PDF export and flashcards' },
  { icon: Clock,    title: 'Study timer',       desc: 'Pomodoro timer with weekly goal, streak counter and 7-day chart' },
  { icon: Sparkles, title: 'Mark schemes',      desc: 'QP and MS side by side — Download or View in a branded split layout' },
];

// ── Personalised dashboard for logged-in users ────────────────────────────────
function Dashboard({ currentUser }) {
  const {
    subjects, history, notesHistory, studyStreak, weeklyMinutes, weeklyGoal,
    last7Days, favourites,
  } = useAppContext();

  const allSubjectCount = Object.values(subjects).flat().length;
  const allHistoryCount = Object.values(history).flat().length;
  const allFavCount     = Object.values(favourites).flat().length;
  const goalPct         = Math.min(100, Math.round(weeklyMinutes / weeklyGoal * 100));
  const maxMins         = Math.max(...last7Days.map(d => d.mins), 30);

  // Active levels (have at least one subject)
  const activeLevels = LEVELS.filter(l => (subjects[l.level] || []).length > 0);

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} className="space-y-6">
      {/* Welcome bar */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-5 text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-200 text-xs font-semibold tracking-wider uppercase mb-1">Welcome back</p>
          <h2 className="text-xl font-bold">{currentUser.name || currentUser.email}</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          {[
            { icon: Flame,  label: 'Day streak',     value: studyStreak },
            { icon: Target, label: 'Weekly goal',     value: `${goalPct}%` },
            { icon: Brain,  label: 'Saved notes',     value: notesHistory.length },
            { icon: Star,   label: 'Favourites',      value: allFavCount },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center min-w-[72px]">
              <Icon className="w-4 h-4 mx-auto mb-1 text-blue-200" />
              <p className="text-lg font-bold leading-none">{value}</p>
              <p className="text-[10px] text-blue-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick-jump level cards */}
      {activeLevels.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3">Your active levels</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {activeLevels.map(l => {
              const count = (subjects[l.level] || []).length;
              const hist  = (history[l.level]  || []).length;
              return (
                <Link key={l.level} to={l.path}>
                  <div className={`p-4 rounded-xl border-2 border-gray-200 ${l.borderHover} bg-gradient-to-br ${l.gradientCard} hover:shadow-md transition-all group`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${l.accent}`}>
                        {l.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-2">
                      <span>{count} subject{count !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{hist} search{hist !== 1 ? 'es' : ''}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-day chart */}
      {last7Days.some(d => d.mins > 0) && (
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />Study time this week
              <span className="text-xs text-gray-400 font-normal ml-auto">{weeklyMinutes} min / {weeklyGoal} min goal</span>
            </p>
            <div className="flex items-end gap-2 h-16">
              {last7Days.map((d, i) => {
                const pct    = d.mins / maxMins;
                const height = Math.max(pct * 56, d.mins > 0 ? 6 : 2);
                const isToday = i === 6;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{ height: 56 }}>
                      <motion.div
                        className={`w-full rounded-t ${isToday ? 'bg-blue-500' : 'bg-blue-200'}`}
                        style={{ height }}
                        initial={{ height:0 }} animate={{ height }} transition={{ duration:0.4, delay:i*0.05 }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>{d.label}</span>
                  </div>
                );
              })}
            </div>
            {/* Goal progress bar */}
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${goalPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                initial={{ width:0 }} animate={{ width:`${goalPct}%` }} transition={{ duration:0.7, delay:0.2 }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-right">
              {goalPct >= 100 ? '🎉 Weekly goal reached!' : `${goalPct}% of weekly goal`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent searches across all levels */}
      {allHistoryCount > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(history).flatMap(([lvl, items]) =>
              items.slice(0, 3).map(h => ({ ...h, level: lvl }))
            ).slice(0, 8).map(h => (
              <Link key={h.id} to={`/${h.level === 'IGCSE' ? 'AcademicSuite' : h.level === 'AS_LEVEL' ? 'ASLevelSuite' : 'OLevelSuite'}`}>
                <span className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-full px-3 py-1.5 transition-colors">
                  <Search className="w-3 h-3" />
                  {h.subject}
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-400 text-[10px]">{h.level.replace('_',' ')}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Home() {
  const { isLoggedIn, currentUser } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="bg-[#05071a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(59,130,246,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(220,38,38,0.12),transparent_50%)]" />
          {Array.from({length:70}).map((_,i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width:`${Math.random()*2+0.5}px`, height:`${Math.random()*2+0.5}px`,
                top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
                opacity:Math.random()*0.6+0.1,
              }}/>
          ))}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.7}}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-5 text-blue-200 text-sm font-semibold border border-white/10">
                <Award className="w-4 h-4" />Cambridge Examination Companion
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 leading-tight tracking-tight">
                <span className="text-blue-400">CAIE</span>
                <span className="text-red-400 ml-2">Scholar</span>
              </h1>
              <p className="text-blue-300 text-xs mb-4 tracking-widest uppercase font-semibold">
                Cambridge Assessment International Education
              </p>
              <p className="text-lg text-blue-100/80 mb-8 leading-relaxed max-w-md">
                Real Cambridge past papers, AI study notes with diagrams, mark scheme viewer, and a study timer — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/AcademicSuite">
                  <Button size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold h-12 px-8 shadow-xl shadow-blue-500/30">
                    <Search className="w-5 h-5 mr-2" />Search Papers
                  </Button>
                </Link>
                {!isLoggedIn && (
                  <Link to="/signup">
                    <Button size="lg" variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 h-12 px-8">
                      Get started free
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
            <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
              transition={{duration:0.8,ease:'easeOut',delay:0.2}} className="flex justify-center">
              <img src="/logo.png" alt="CAIE Scholar"
                className="w-full max-w-sm drop-shadow-2xl"
                style={{filter:'drop-shadow(0 0 60px rgba(59,130,246,0.5))'}}/>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Dashboard (logged in) or level cards (guest) ─────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoggedIn && currentUser ? (
          <Dashboard currentUser={currentUser} />
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Choose your level</h2>
            <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
              Each Cambridge qualification has its own colour scheme — you'll always know which level you're on.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {LEVELS.map(({ name, fullName, aliases, path, description, gradientCard, accent, borderHover, iconBg, icon: Icon, features }, i) => (
                <motion.div key={name} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.12}}>
                  <Link to={path}>
                    <Card className={`border-2 border-gray-200 ${borderHover} shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br ${gradientCard}`}>
                      <div className={`h-1.5 bg-gradient-to-r ${accent} rounded-t-xl`} />
                      <CardContent className="p-7">
                        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-1 text-gray-900">{name}</h3>
                        <p className="text-xs text-gray-500 font-medium mb-2 leading-tight">{fullName}</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {aliases.map(a => (
                            <span key={a} className="text-[10px] bg-white/70 border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">{a}</span>
                          ))}
                        </div>
                        <p className="text-gray-500 text-sm mb-5 leading-relaxed">{description}</p>
                        <ul className="space-y-2">
                          {features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Features strip ──────────────────────────────────────────────── */}
      <div className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Everything built in</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center px-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
