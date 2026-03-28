/**
 * Onboarding.jsx
 * Three-step welcome flow shown once on first visit.
 * Step 1 — app introduction / how it works
 * Step 2 — pick study level
 * Step 3 — pick subjects for that level
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, BookOpen, Search, Clock, Sparkles, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { IGCSE_SUBJECTS, AS_LEVEL_SUBJECTS, O_LEVEL_SUBJECTS, toCodeMap } from '@/data/subjects';
import { useNavigate } from 'react-router-dom';

// Subject lists per level
const SUBJECTS_BY_LEVEL = {
  IGCSE: [
    { name: 'Mathematics',            code: '0580' },
    { name: 'Physics',                code: '0625' },
    { name: 'Chemistry',              code: '0620' },
    { name: 'Biology',                code: '0610' },
    { name: 'English - First Language', code: '0500' },
    { name: 'English - Second Language', code: '0510' },
    { name: 'Computer Science',       code: '0478' },
    { name: 'Economics',              code: '0455' },
    { name: 'Business Studies',       code: '0450' },
    { name: 'History',                code: '0470' },
    { name: 'Geography',              code: '0460' },
    { name: 'Accounting',             code: '0452' },
    { name: 'Sociology',              code: '0495' },
    { name: 'Mathematics - Additional', code: '0606' },
    { name: 'ICT',                    code: '0417' },
    { name: 'Co-ordinated Sciences',  code: '0654' },
  ],
  AS_LEVEL: [
    { name: 'Mathematics',     code: '9709' },
    { name: 'Physics',         code: '9702' },
    { name: 'Chemistry',       code: '9701' },
    { name: 'Biology',         code: '9700' },
    { name: 'Computer Science', code: '9618' },
    { name: 'Economics',       code: '9708' },
    { name: 'Business',        code: '9609' },
    { name: 'History',         code: '9489' },
    { name: 'Geography',       code: '9696' },
    { name: 'Accounting',      code: '9706' },
    { name: 'Psychology',      code: '9990' },
    { name: 'Sociology',       code: '9699' },
    { name: 'English Language', code: '9093' },
  ],
  O_LEVEL: [
    { name: 'Mathematics',     code: '4024' },
    { name: 'Physics',         code: '5054' },
    { name: 'Chemistry',       code: '5070' },
    { name: 'Biology',         code: '5090' },
    { name: 'English Language', code: '1123' },
    { name: 'Computer Science', code: '2210' },
    { name: 'Economics',       code: '2281' },
    { name: 'History',         code: '2147' },
    { name: 'Geography',       code: '2217' },
    { name: 'Accounting',      code: '7110' },
    { name: 'Commerce',        code: '7100' },
  ],
};

const LEVELS = [
  {
    id: 'IGCSE', label: 'IGCSE',
    sub: 'International General Certificate of Secondary Education',
    alias: 'O-Level equivalent · Ages 14–16',
    colour: 'from-blue-700 to-indigo-700',
    light: 'bg-blue-50 border-blue-300',
    path: '/AcademicHub',
  },
  {
    id: 'AS_LEVEL', label: 'AS & A-Level',
    sub: 'General Certificate of Education Advanced Level',
    alias: 'Pre-university · Ages 16–18',
    colour: 'from-amber-700 to-red-700',
    light: 'bg-amber-50 border-amber-300',
    path: '/ASLevelHub',
  },
  {
    id: 'O_LEVEL', label: 'O-Level',
    sub: 'General Certificate of Education Ordinary Level',
    alias: 'Cambridge O Level · Ages 14–16',
    colour: 'from-emerald-700 to-teal-700',
    light: 'bg-emerald-50 border-emerald-300',
    path: '/OLevelHub',
  },
];

const HOW_IT_WORKS = [
  { icon: Search,   title: 'Search real past papers', desc: 'Type a subject and instantly get Cambridge PDFs from PapaCambridge and GCE Guide.' },
  { icon: BookOpen, title: 'View papers & mark schemes', desc: 'Open question papers and mark schemes side by side directly in the browser — no download needed.' },
  { icon: Sparkles, title: 'Generate AI study notes', desc: 'Enter any topic and Claude generates detailed notes, worked examples, and practice questions.' },
  { icon: Clock,    title: 'Track your study time', desc: 'Use the Pomodoro timer per subject and watch your session history build up.' },
  { icon: Star,     title: 'Save favourites', desc: 'Star any search to save it. Find it again instantly in your Favourites tab.' },
];

export default function Onboarding() {
  const [step, setStep]     = useState(0);   // 0=intro, 1=level, 2=subjects
  const [level, setLevel]   = useState(null);
  const [picked, setPicked] = useState(new Set());

  const { dismissOnboarding, addSubject } = useAppContext();
  const navigate = useNavigate();

  const toggleSubject = (s) => {
    setPicked(prev => {
      const next = new Set(prev);
      next.has(s.code) ? next.delete(s.code) : next.add(s.code);
      return next;
    });
  };

  const finish = () => {
    const codes = [...picked];
    dismissOnboarding();
    // Also add picked subjects to context
    const subjectList = SUBJECTS_BY_LEVEL[level.id] || [];
    subjectList
      .filter(s => codes.includes(s.code))
      .forEach(s => addSubject(level.id, s));
    navigate(level.path);
  };

  const levelSubjects = level ? (SUBJECTS_BY_LEVEL[level.id] || []) : [];

  const onboardingStars = useMemo(() => Array.from({length:65},(_,i)=>({
    id:i, x:Math.random()*100, y:Math.random()*100,
    r:Math.random()*1.8+0.4, op:Math.random()*0.45+0.12,
    dur:Math.random()*7+4, delay:Math.random()*-10,
  })),[]);

  return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated starfield */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(59,130,246,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(139,92,246,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_80%,rgba(16,185,129,0.08),transparent_55%)]" />
        {onboardingStars.map(s => (
          <motion.div key={s.id} className="absolute rounded-full bg-white"
            style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.r, height:s.r, opacity:s.op }}
            animate={{ opacity:[s.op,s.op*2.5,s.op], scale:[1,1.6,1] }}
            transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="CAIE Scholar" className="w-28 h-28 object-contain mx-auto mb-2"
            style={{ filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.4))' }} />
          <h1 className="text-2xl font-bold">
            <span className="text-blue-400">CAIE</span>
            <span className="text-red-400 ml-1.5">Scholar</span>
          </h1>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mb-6">
          {[0,1,2].map(i => (
            <div key={i} className={`rounded-full transition-all ${
              i === step ? 'w-8 h-2 bg-blue-400' : 'w-2 h-2 bg-white/20'
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 0: How it works ── */}
          {step === 0 && (
            <motion.div key="step0"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to CAIE Scholar</h2>
                <p className="text-blue-200 mb-7 text-sm">Here's how the app helps you prepare for Cambridge exams</p>
                <div className="space-y-4">
                  {HOW_IT_WORKS.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-4">
                      <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-blue-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{title}</p>
                        <p className="text-blue-300/80 text-xs mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setStep(1)}
                  className="w-full mt-8 h-11 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl">
                  Get started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Pick level ── */}
          {step === 1 && (
            <motion.div key="step1"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Choose your level</h2>
                <p className="text-blue-200 mb-6 text-sm">You can switch anytime from the navigation</p>
                <div className="space-y-3">
                  {LEVELS.map(l => (
                    <button key={l.id} onClick={() => setLevel(l)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        level?.id === l.id
                          ? 'border-white/60 bg-white/15'
                          : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${l.colour} text-white`}>
                              {l.label}
                            </span>
                          </div>
                          <p className="text-white text-sm font-semibold mt-1">{l.sub}</p>
                          <p className="text-blue-300/70 text-xs mt-0.5">{l.alias}</p>
                        </div>
                        {level?.id === l.id && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="ghost" onClick={() => setStep(0)}
                    className="flex-1 h-11 text-white/60 hover:text-white border border-white/10">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={() => { if (level) setStep(2); }}
                    disabled={!level}
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl disabled:opacity-40">
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Pick subjects ── */}
          {step === 2 && level && (
            <motion.div key="step2"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-1">Pick your subjects</h2>
                <p className="text-blue-200 mb-5 text-sm">
                  These will appear in <strong className="text-white">My Subjects</strong> on the {level.label} page. Add more anytime.
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {levelSubjects.map(s => {
                    const active = picked.has(s.code);
                    return (
                      <button key={s.code} onClick={() => toggleSubject(s)}
                        className={`flex items-center justify-between text-left px-3 py-2.5 rounded-xl border transition-all text-sm ${
                          active
                            ? `border-transparent bg-gradient-to-r ${level.colour} text-white`
                            : 'border-white/10 bg-white/5 text-blue-200 hover:border-white/30 hover:bg-white/10'
                        }`}>
                        <span className="truncate pr-1">{s.name}</span>
                        {active
                          ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          : <span className="text-xs text-white/30 flex-shrink-0">{s.code}</span>
                        }
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-blue-400/60 mt-3">{picked.size} subject{picked.size !== 1 ? 's' : ''} selected</p>
                <div className="flex gap-3 mt-5">
                  <Button variant="ghost" onClick={() => setStep(1)}
                    className="flex-1 h-11 text-white/60 hover:text-white border border-white/10">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button onClick={finish}
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl">
                    Let's go! <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
