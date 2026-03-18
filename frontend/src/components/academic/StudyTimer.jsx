/**
 * StudyTimer.jsx
 * Real-time Pomodoro timer with:
 *  - Accurate Date.now() delta tick
 *  - Weekly goal progress ring
 *  - Last 7 days bar chart
 *  - Subject colour coding in session list
 *  - Exam countdown per subject
 *  - Desktop notifications
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock, Save, Bell, Target, TrendingUp, Calendar, Flame, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppContext } from '@/context/AppContext';

const STORAGE_KEY = 'caie_study_sessions';

const PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
  { label: '90 min', minutes: 90 },
];

// Stable colour per subject name (hash → one of 8 colours)
const SUBJECT_COLOURS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
];
function subjectColour(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return SUBJECT_COLOURS[h % SUBJECT_COLOURS.length];
}

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function saveSessions(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

// Days until a date string "YYYY-MM-DD"
function daysUntil(isoDate) {
  if (!isoDate) return null;
  const diff = new Date(isoDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
  return Math.ceil(diff / 86400000);
}

export default function StudyTimer({ level }) {
  const { subjects, examDates, setExamDate, weeklyGoal, setWeeklyGoal, last7Days, studyStreak, weeklyMinutes } = useAppContext();
  const mySubjects = subjects?.[level] || [];

  const [preset,    setPreset]    = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running,   setRunning]   = useState(false);
  const [finished,  setFinished]  = useState(false);
  const [subject,   setSubject]   = useState('');
  const [sessions,  setSessions]  = useState(loadSessions);
  const [editGoal,  setEditGoal]  = useState(false);
  const [goalInput, setGoalInput] = useState(String(weeklyGoal));

  const intervalRef  = useRef(null);
  const startTimeRef = useRef(null);
  const baseRemRef   = useRef(remaining);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (!running) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRem  = Math.max(0, baseRemRef.current - elapsed);
      setRemaining(newRem);
      if (newRem === 0) {
        clearInterval(intervalRef.current);
        setRunning(false); setFinished(true);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('CAIE Scholar — Session complete! 🎉', {
            body: `Great work${subject ? ` on ${subject}` : ''}! Take a break.`,
            icon: '/logo.png',
          });
        }
        toast.success('Session complete! Great work 🎉');
      }
    }, 500);
    return () => clearInterval(intervalRef.current);
  }, [running, subject]);

  const handleStart = () => { if (!finished) { baseRemRef.current = remaining; setRunning(true); } };
  const handlePause = () => { setRunning(false); baseRemRef.current = remaining; };
  const handleReset = useCallback(() => {
    setRunning(false); setFinished(false);
    const s = preset * 60; setRemaining(s); baseRemRef.current = s;
  }, [preset]);
  const handlePreset = (mins) => {
    setRunning(false); setFinished(false); setPreset(mins);
    const s = mins * 60; setRemaining(s); baseRemRef.current = s;
  };
  const handleSave = () => {
    const elapsed = Math.max(1, Math.round((preset * 60 - remaining) / 60));
    const session = {
      id: Date.now(),
      subject: subject || 'General Study',
      duration: elapsed,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      level: level || '',
    };
    const updated = [session, ...sessions].slice(0, 50);
    setSessions(updated); saveSessions(updated);
    handleReset();
    toast.success(`Session saved — ${elapsed} min${elapsed !== 1 ? 's' : ''}`);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pad  = n => String(n).padStart(2, '0');
  const circ = 2 * Math.PI * 88;
  const progress = preset * 60 > 0 ? (preset * 60 - remaining) / (preset * 60) : 0;
  const offset   = circ * (1 - progress);

  // Weekly stats (re-read from localStorage since AppContext useMemo only runs once)
  const weeklyMins = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7)); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
    return sessions.filter(s => {
      const p = (s.date||'').split('/');
      if (p.length !== 3) return false;
      const d = new Date(+p[2], +p[1]-1, +p[0]);
      return d >= mon && d <= sun;
    }).reduce((a, s) => a + (s.duration||0), 0);
  }, [sessions]);

  const goalPct = Math.min(100, Math.round(weeklyMins / weeklyGoal * 100));

  // Nearest exam countdown for selected subject
  const selectedCode = mySubjects.find(s => s.name === subject)?.code;
  const examDate     = selectedCode ? examDates?.[level]?.[selectedCode] : null;
  const daysLeft     = daysUntil(examDate);

  // Bar chart max
  const maxMins = Math.max(...last7Days.map(d => d.mins), 30);

  // Total study hours all-time
  const totalHours = Math.round(sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60 * 10) / 10;

  return (
    <div className="space-y-5">

      {/* ── Study statistics strip ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Flame,
            label: 'Day streak',
            value: studyStreak,
            unit: studyStreak === 1 ? 'day' : 'days',
            colour: 'text-orange-500',
            bg: 'from-orange-50 to-amber-50',
            border: 'border-orange-200',
          },
          {
            icon: Target,
            label: 'Weekly goal',
            value: `${Math.min(100, Math.round(weeklyMins / weeklyGoal * 100))}%`,
            unit: `${weeklyMins}/${weeklyGoal} min`,
            colour: 'text-purple-600',
            bg: 'from-purple-50 to-pink-50',
            border: 'border-purple-200',
          },
          {
            icon: Clock,
            label: 'This week',
            value: weeklyMins,
            unit: 'min studied',
            colour: 'text-blue-600',
            bg: 'from-blue-50 to-indigo-50',
            border: 'border-blue-200',
          },
          {
            icon: Award,
            label: 'All time',
            value: totalHours,
            unit: 'hours studied',
            colour: 'text-green-600',
            bg: 'from-green-50 to-emerald-50',
            border: 'border-green-200',
          },
        ].map(({ icon: Icon, label, value, unit, colour, bg, border }) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${bg} border ${border} rounded-2xl p-4 flex flex-col gap-1`}>
            <div className="flex items-center gap-1.5">
              <Icon className={`w-4 h-4 ${colour}`} />
              <span className="text-xs font-semibold text-gray-500">{label}</span>
            </div>
            <p className={`text-2xl font-bold tabular-nums ${colour}`}>{value}</p>
            <p className="text-xs text-gray-400">{unit}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Top row: Timer + Weekly goal ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Timer card */}
        <Card className="border-none shadow-xl bg-white/90">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-5 h-5 text-blue-600" />Study Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center gap-4">
            {/* Presets */}
            <div className="flex gap-2 flex-wrap justify-center">
              {PRESETS.map(p => (
                <button key={p.minutes} onClick={() => handlePreset(p.minutes)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    preset === p.minutes && !running
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>{p.label}</button>
              ))}
            </div>

            {/* Clock ring */}
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="88" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="100" cy="100" r="88" fill="none"
                  stroke={finished ? '#22c55e' : running ? '#3b82f6' : '#a5b4fc'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold tabular-nums tracking-tight ${
                  finished ? 'text-green-600' : running ? 'text-blue-600' : 'text-gray-800'
                }`}>{pad(mins)}:{pad(secs)}</span>
                <span className="text-xs text-gray-400 mt-1">
                  {finished ? 'Done — save it!' : running ? 'Focusing…' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Subject + exam countdown */}
            <div className="w-full space-y-2">
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500">
                <option value="">General Study</option>
                {mySubjects.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
              </select>

              {/* Exam countdown badge */}
              <AnimatePresence>
                {subject && daysLeft !== null && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                      daysLeft <= 7  ? 'bg-red-50 text-red-700 border border-red-200' :
                      daysLeft <= 30 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                       'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {daysLeft > 0 ? `Exam in ${daysLeft} day${daysLeft!==1?'s':''}` : daysLeft === 0 ? 'Exam is today!' : 'Exam has passed'}
                      </div>
                      <span className="opacity-60">{new Date(examDate).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
                    </div>
                  </motion.div>
                )}
                {subject && daysLeft === null && selectedCode && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                    <ExamDateSetter level={level} subjectCode={selectedCode} subjectName={subject} setExamDate={setExamDate} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex gap-3 items-center">
              {!running
                ? <Button onClick={handleStart} disabled={finished && remaining===0}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 h-11 rounded-xl font-semibold gap-2">
                    <Play className="w-4 h-4" />Start
                  </Button>
                : <Button onClick={handlePause} variant="outline"
                    className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-8 h-11 rounded-xl font-semibold gap-2">
                    <Pause className="w-4 h-4" />Pause
                  </Button>
              }
              <Button variant="outline" onClick={handleReset} className="h-11 w-11 rounded-xl border-2">
                <RotateCcw className="w-4 h-4" />
              </Button>
              {!running && remaining < preset * 60 && remaining !== preset * 60 && (
                <Button onClick={handleSave} variant="outline"
                  className="border-2 border-green-300 text-green-700 hover:bg-green-50 h-11 px-4 rounded-xl font-semibold gap-2">
                  <Save className="w-4 h-4" />Save
                </Button>
              )}
            </div>

            {'Notification' in window && Notification.permission !== 'granted' && (
              <button onClick={() => Notification.requestPermission().then(p => p==='granted' && toast.success('Notifications enabled!'))}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 mt-1">
                <Bell className="w-3.5 h-3.5" />Enable desktop notifications
              </button>
            )}
          </CardContent>
        </Card>

        {/* Weekly goal card */}
        <Card className="border-none shadow-xl bg-white/90">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="w-5 h-5 text-purple-600" />Weekly Goal
              </CardTitle>
              <button onClick={() => { setEditGoal(e => !e); setGoalInput(String(weeklyGoal)); }}
                className="text-xs text-purple-500 hover:text-purple-700 font-medium">
                {editGoal ? 'Cancel' : 'Edit goal'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center gap-5">
            {/* Goal ring */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="66" fill="none" stroke="#f3e8ff" strokeWidth="10" />
                <circle cx="80" cy="80" r="66" fill="none"
                  stroke={goalPct >= 100 ? '#22c55e' : '#a855f7'}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 66}
                  strokeDashoffset={2 * Math.PI * 66 * (1 - goalPct / 100)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold tabular-nums ${goalPct >= 100 ? 'text-green-600' : 'text-purple-700'}`}>
                  {goalPct}%
                </span>
                <span className="text-xs text-gray-400 mt-0.5">{weeklyMins} / {weeklyGoal} min</span>
              </div>
            </div>

            {editGoal
              ? <div className="flex items-center gap-2 w-full">
                  <input type="number" min="30" max="2100" step="30"
                    value={goalInput} onChange={e => setGoalInput(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-purple-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                  <span className="text-sm text-gray-500 flex-shrink-0">min/week</span>
                  <Button size="sm" onClick={() => { setWeeklyGoal(goalInput); setEditGoal(false); toast.success('Goal updated!'); }}
                    className="bg-purple-600 text-white rounded-xl">Save</Button>
                </div>
              : <p className="text-sm text-gray-500">
                  {goalPct >= 100
                    ? '🎉 Weekly goal reached! Amazing work.'
                    : `${weeklyGoal - weeklyMins} min to reach your ${weeklyGoal} min weekly goal`}
                </p>
            }

            {/* 7-day bar chart */}
            <div className="w-full">
              <p className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />Last 7 days
              </p>
              <div className="flex items-end gap-1.5 h-20">
                {last7Days.map((d, i) => {
                  const pct    = maxMins > 0 ? d.mins / maxMins : 0;
                  const height = Math.max(pct * 72, d.mins > 0 ? 6 : 2);
                  const isToday = i === 6;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      {d.mins > 0 && (
                        <span className="text-[9px] text-gray-400 font-medium">{d.mins}m</span>
                      )}
                      <div className="w-full flex items-end" style={{ height: 72 }}>
                        <motion.div
                          className={`w-full rounded-t-md ${isToday ? 'bg-blue-500' : 'bg-purple-300'}`}
                          style={{ height }}
                          initial={{ height: 0 }}
                          animate={{ height }}
                          transition={{ duration: 0.4, delay: i * 0.06 }}
                        />
                      </div>
                      <span className={`text-[10px] font-medium ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Session history ───────────────────────────────────────────── */}
      <Card className="border-none shadow-xl bg-white/90">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="w-5 h-5 text-gray-500" />Sessions
              {sessions.length > 0 && (
                <span className="text-xs text-gray-400 font-normal ml-1">
                  — {sessions.reduce((a,s) => a+(s.duration||0), 0)} min total
                </span>
              )}
            </CardTitle>
            {sessions.length >= 5 && (
              <button onClick={() => { setSessions([]); saveSessions([]); }}
                className="text-xs text-red-400 hover:text-red-600">Clear all</button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {sessions.length === 0
            ? <div className="text-center py-10">
                <Clock className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">No sessions yet — start the timer!</p>
              </div>
            : <div className="space-y-2 max-h-72 overflow-y-auto">
                {sessions.map((s, i) => (
                  <motion.div key={s.id}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${subjectColour(s.subject)}`}>
                        {s.subject.length > 14 ? s.subject.slice(0,14) + '…' : s.subject}
                      </span>
                      <span className="text-xs text-gray-400">{s.date} · {s.time}</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full">
                      {s.duration}m
                    </span>
                  </motion.div>
                ))}
              </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}

// ── Inline exam date setter ───────────────────────────────────────────────────
function ExamDateSetter({ level, subjectCode, subjectName, setExamDate }) {
  const [show, setShow] = useState(false);
  if (!show) return (
    <button onClick={() => setShow(true)}
      className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 px-3 py-1.5 border border-dashed border-blue-300 rounded-lg w-full justify-center hover:bg-blue-50 transition-colors">
      <Calendar className="w-3.5 h-3.5" />Set exam date for {subjectName}
    </button>
  );
  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
      <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
      <input type="date"
        min={new Date().toISOString().split('T')[0]}
        onChange={e => { if (e.target.value) { setExamDate(level, subjectCode, e.target.value); setShow(false); toast.success(`Exam date set for ${subjectName}`); } }}
        className="flex-1 text-xs bg-transparent border-none outline-none text-blue-700"
      />
      <button onClick={() => setShow(false)} className="text-blue-400 hover:text-blue-600 text-xs">Cancel</button>
    </div>
  );
}
