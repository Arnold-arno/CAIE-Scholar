/**
 * AppContext.jsx — Central state, zero external dependencies.
 *
 * currentUser shape: { email, name, avatar? }
 *   avatar = base64 data-URL string (resized to 128×128 in Signup)
 *
 * New: updateProfile(patch) — merge patch into currentUser + persist
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function computeStreak(sessions) {
  if (!sessions.length) return 0;
  const days  = new Set(sessions.map(s => s.date));
  const today = new Date();
  let streak  = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (days.has(d.toLocaleDateString('en-GB'))) { streak++; }
    else if (i > 0) break;
  }
  return streak;
}

const Ctx = createContext(null);

export function AppProvider({ children }) {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [isLoggedIn,  setIsLoggedIn]  = useState(() => load('is_logged_in', false));
  const [currentUser, setCurrentUser] = useState(() => load('current_user', null));
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return sessionStorage.getItem('show_onboarding') === 'true'; } catch { return false; }
  });

  const login = useCallback((email) => {
    const user = { email, name: email.split('@')[0] };
    save('is_logged_in', true); save('current_user', user);
    setIsLoggedIn(true); setCurrentUser(user);
  }, []);

  const signup = useCallback((name, email, avatar = null) => {
    const user = { email, name, ...(avatar ? { avatar } : {}) };
    save('is_logged_in', true); save('current_user', user);
    setIsLoggedIn(true); setCurrentUser(user);
    try { sessionStorage.setItem('show_onboarding', 'true'); } catch {}
    setShowOnboarding(true);
  }, []);

  const logout = useCallback(() => {
    save('is_logged_in', false); save('current_user', null);
    setIsLoggedIn(false); setCurrentUser(null);
  }, []);

  const dismissOnboarding = useCallback(() => {
    try { sessionStorage.removeItem('show_onboarding'); } catch {}
    setShowOnboarding(false);
  }, []);

  // Update name / avatar after signup
  const updateProfile = useCallback((patch) => {
    setCurrentUser(prev => {
      const next = { ...prev, ...patch };
      save('current_user', next);
      return next;
    });
  }, []);

  // ── Subjects ──────────────────────────────────────────────────────────────
  const [subjects, setSubjectsRaw] = useState({
    IGCSE:    load('subjects_IGCSE',    []),
    AS_LEVEL: load('subjects_AS_LEVEL', []),
    O_LEVEL:  load('subjects_O_LEVEL',  []),
  });
  const addSubject = useCallback((level, subject) => {
    setSubjectsRaw(prev => {
      if (prev[level]?.find(s => s.code === subject.code)) return prev;
      const next = [...(prev[level] || []), { ...subject, addedAt: Date.now() }];
      save(`subjects_${level}`, next); return { ...prev, [level]: next };
    });
  }, []);
  const removeSubject = useCallback((level, code) => {
    setSubjectsRaw(prev => {
      const next = (prev[level] || []).filter(s => s.code !== code);
      save(`subjects_${level}`, next); return { ...prev, [level]: next };
    });
  }, []);

  // ── Search history ────────────────────────────────────────────────────────
  const [history, setHistoryRaw] = useState({
    IGCSE:    load('history_IGCSE',    []),
    AS_LEVEL: load('history_AS_LEVEL', []),
    O_LEVEL:  load('history_O_LEVEL',  []),
  });
  const addToHistory = useCallback((level, entry) => {
    setHistoryRaw(prev => {
      const existing = prev[level] || [];
      const deduped  = existing.filter(h => !(h.subject === entry.subject && h.topic === entry.topic));
      const next     = [{ ...entry, id: Date.now(), searchedAt: Date.now() }, ...deduped].slice(0, 8);
      save(`history_${level}`, next); return { ...prev, [level]: next };
    });
  }, []);
  const clearHistory = useCallback((level) => {
    setHistoryRaw(prev => { save(`history_${level}`, []); return { ...prev, [level]: [] }; });
  }, []);

  // ── Favourites ────────────────────────────────────────────────────────────
  const [favourites, setFavsRaw] = useState({
    IGCSE:    load('favs_IGCSE',    []),
    AS_LEVEL: load('favs_AS_LEVEL', []),
    O_LEVEL:  load('favs_O_LEVEL',  []),
  });
  const toggleFavourite = useCallback((level, entry) => {
    setFavsRaw(prev => {
      const existing = prev[level] || [];
      const idx      = existing.findIndex(f => f.subject === entry.subject && f.topic === entry.topic);
      const next     = idx >= 0 ? existing.filter((_, i) => i !== idx) : [...existing, { ...entry, id: Date.now(), savedAt: Date.now() }];
      save(`favs_${level}`, next); return { ...prev, [level]: next };
    });
  }, []);
  const isFavourite = useCallback((level, entry) =>
    (favourites[level] || []).some(f => f.subject === entry.subject && f.topic === entry.topic)
  , [favourites]);

  // ── Notes history ─────────────────────────────────────────────────────────
  const [notesHistory, setNotesHistoryRaw] = useState(() => load('notes_history', []));
  const saveNotesSession = useCallback((session) => {
    setNotesHistoryRaw(prev => {
      const deduped = prev.filter(h => !(h.subject === session.subject && h.topic === session.topic && h.examType === session.examType));
      const next    = [{ ...session, id: Date.now(), savedAt: Date.now() }, ...deduped].slice(0, 20);
      save('notes_history', next); return next;
    });
  }, []);
  const deleteNotesSession = useCallback((id) => {
    setNotesHistoryRaw(prev => { const next = prev.filter(h => h.id !== id); save('notes_history', next); return next; });
  }, []);
  const clearNotesHistory = useCallback(() => { save('notes_history', []); setNotesHistoryRaw([]); }, []);

  // ── Exam dates ────────────────────────────────────────────────────────────
  const [examDates, setExamDatesRaw] = useState(() => load('exam_dates', {}));
  const setExamDate = useCallback((level, subjectCode, isoDate) => {
    setExamDatesRaw(prev => {
      const next = { ...prev, [level]: { ...(prev[level] || {}), [subjectCode]: isoDate } };
      if (!isoDate) delete next[level][subjectCode];
      save('exam_dates', next); return next;
    });
  }, []);

  // ── Weekly goal ───────────────────────────────────────────────────────────
  const [weeklyGoal, setWeeklyGoalRaw] = useState(() => load('weekly_goal', 300));
  const setWeeklyGoal = useCallback((mins) => {
    const v = Math.max(30, Math.min(2100, Number(mins) || 300));
    save('weekly_goal', v); setWeeklyGoalRaw(v);
  }, []);

  // ── Derived study stats ───────────────────────────────────────────────────
  const studySessions = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('caie_study_sessions') || '[]'); } catch { return []; }
  }, []);

  const studyStreak = useMemo(() => computeStreak(studySessions), [studySessions]);

  const weeklyMinutes = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7)); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
    return studySessions.filter(s => {
      const p = (s.date || '').split('/');
      if (p.length !== 3) return false;
      const d = new Date(+p[2], +p[1]-1, +p[0]);
      return d >= mon && d <= sun;
    }).reduce((a, s) => a + (s.duration || 0), 0);
  }, [studySessions]);

  const last7Days = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      return { label: d.toLocaleDateString('en-GB', { weekday: 'short' }), date: d.toLocaleDateString('en-GB'), mins: 0 };
    });
    for (const s of studySessions) {
      const idx = days.findIndex(d => d.date === s.date);
      if (idx >= 0) days[idx].mins += s.duration || 0;
    }
    return days;
  }, [studySessions]);

  return (
    <Ctx.Provider value={{
      isLoggedIn, currentUser, login, signup, logout, updateProfile,
      showOnboarding, dismissOnboarding,
      subjects, addSubject, removeSubject,
      history, addToHistory, clearHistory,
      favourites, toggleFavourite, isFavourite,
      notesHistory, saveNotesSession, deleteNotesSession, clearNotesHistory,
      examDates, setExamDate,
      weeklyGoal, setWeeklyGoal,
      studySessions, studyStreak, weeklyMinutes, last7Days,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}
