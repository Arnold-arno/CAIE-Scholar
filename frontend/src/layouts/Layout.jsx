/**
 * Layout.jsx — App shell: top navbar, mobile bottom nav, command palette, footer.
 *
 * Mobile:  sticky top bar (logo + hamburger) + fixed bottom tab bar (5 tabs)
 * Tablet:  sticky top bar with compact nav pills
 * Desktop: full top bar with all nav items, profile dropdown, secondary sub-nav
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Book, Menu, X, Activity, Search, LogOut, Command,
  Camera, Check, Settings, GraduationCap, Brain, Clock,
  User, Star, ChevronRight, Send,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import AvatarCircle from '@/components/ui/avatar';
import AvatarPicker from '@/components/ui/avatar-picker';
import { SelectionReader } from '@/components/ui/read-aloud';
import KeyboardShortcuts from '@/components/ui/keyboard-shortcuts';
import BackToTop from '@/components/ui/back-to-top';
import PageProgress from '@/components/ui/page-progress';
import { useI18n } from '@/context/I18nContext';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function pingBackend() {
  try {
    const r = await fetch(`${API}/api/health`, { signal: AbortSignal.timeout(3000) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

// ── Nav structure ─────────────────────────────────────────────────────────────
const TOP_NAV = [
  { name: 'Home',         path: '/',            icon: Home },
  { name: 'IGCSE',        path: '/AcademicHub', icon: GraduationCap },
  { name: 'AS & A-Level', path: '/ASLevelHub',  icon: GraduationCap },
  { name: 'O-Level',      path: '/OLevelHub',   icon: GraduationCap },
];

// Bottom tab bar items for mobile
const BOTTOM_TABS = [
  { name: 'Home',      path: '/',            icon: Home },
  { name: 'IGCSE',     path: '/AcademicHub', icon: GraduationCap },
  { name: 'A-Level',   path: '/ASLevelHub',  icon: Brain },
  { name: 'O-Level',   path: '/OLevelHub',   icon: Book },
  { name: 'Settings',  path: '/settings',    icon: Settings },
];

// Sub-tabs shown below the top bar on hub pages
const SIDE_NAV = {
  '/AcademicHub': [
    { label: 'Search',    tab: 'papers',   icon: Search },
    { label: 'Subjects',  tab: 'subjects', icon: Book   },
    { label: 'AI Notes',  tab: 'ai-notes', icon: Brain  },
    { label: 'Timer',     tab: 'timer',    icon: Clock  },
  ],
  '/ASLevelHub': [
    { label: 'Search',    tab: 'papers',   icon: Search },
    { label: 'Subjects',  tab: 'subjects', icon: Book   },
    { label: 'AI Notes',  tab: 'ai-notes', icon: Brain  },
    { label: 'Timer',     tab: 'timer',    icon: Clock  },
  ],
  '/OLevelHub': [
    { label: 'Search',    tab: 'papers',   icon: Search },
    { label: 'Subjects',  tab: 'subjects', icon: Book   },
    { label: 'AI Notes',  tab: 'ai-notes', icon: Brain  },
    { label: 'Timer',     tab: 'timer',    icon: Clock  },
  ],
};

const COMMANDS = [
  { label: 'Home',                      path: '/',            icon: Home,         group: 'Navigate' },
  { label: 'IGCSE Study Hub',           path: '/AcademicHub', icon: GraduationCap,group: 'Navigate' },
  { label: 'AS & A-Level Study Hub',    path: '/ASLevelHub',  icon: GraduationCap,group: 'Navigate' },
  { label: 'O-Level Study Hub',         path: '/OLevelHub',   icon: GraduationCap,group: 'Navigate' },
  { label: 'Settings',                  path: '/settings',    icon: Settings,     group: 'Navigate' },
  { label: 'IGCSE — Search Questions',  path: '/AcademicHub', icon: Search,       group: 'Quick jump' },
  { label: 'A-Level — Search Questions',path: '/ASLevelHub',  icon: Search,       group: 'Quick jump' },
  { label: 'O-Level — Search Questions',path: '/OLevelHub',   icon: Search,       group: 'Quick jump' },
  { label: 'API docs', path: null, url: `${API}/docs`,        icon: Activity,     group: 'Tools' },
];

// ── Command Palette ───────────────────────────────────────────────────────────
function CommandPalette({ onClose }) {
  const [q, setQ]     = useState('');
  const [sel, setSel] = useState(0);
  const navigate      = useNavigate();
  const inputRef      = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = COMMANDS.filter(c =>
    !q || c.label.toLowerCase().includes(q.toLowerCase()) || c.group.toLowerCase().includes(q.toLowerCase())
  );
  useEffect(() => setSel(0), [q]);

  const execute = useCallback((cmd) => {
    onClose();
    if (cmd.url) { window.open(cmd.url, '_blank'); return; }
    navigate(cmd.path);
  }, [navigate, onClose]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s+1, filtered.length-1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s-1, 0)); }
      if (e.key === 'Enter')     { if (filtered[sel]) execute(filtered[sel]); }
      if (e.key === 'Escape')    onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [filtered, sel, execute, onClose]);

  const groups = [...new Set(filtered.map(c => c.group))];

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-20 px-4"
      onClick={onClose}>
      <motion.div initial={{opacity:0,scale:0.95,y:-10}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.95,y:-10}} transition={{duration:0.15}}
        className="w-full max-w-lg bg-white dark:bg-[hsl(222,24%,11%)] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[hsl(222,18%,22%)]"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-[hsl(222,18%,18%)]">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0"/>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search pages, features…"
            className="flex-1 text-sm outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400"/>
          <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded hidden sm:inline">Esc</kbd>
        </div>
        <div className="max-h-64 sm:max-h-72 overflow-y-auto pb-2">
          {groups.map(group => (
            <div key={group}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">{group}</p>
              {filtered.filter(c => c.group === group).map(cmd => {
                const idx = filtered.indexOf(cmd);
                return (
                  <button key={cmd.label} onClick={() => execute(cmd)} onMouseEnter={() => setSel(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      sel===idx ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[hsl(222,22%,15%)]'
                    }`}>
                    <cmd.icon className={`w-4 h-4 flex-shrink-0 ${sel===idx?'text-blue-500':'text-gray-400'}`}/>
                    {cmd.label}
                  </button>
                );
              })}
            </div>
          ))}
          {!filtered.length && <p className="text-center py-8 text-gray-400 text-sm">No results for "{q}"</p>}
        </div>
        <div className="px-4 py-2 border-t border-gray-100 dark:border-[hsl(222,18%,18%)] hidden sm:flex items-center gap-4 text-xs text-gray-400">
          <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">↵</kbd> Open</span>
          <span><kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded">Esc</kbd> Close</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ currentUser, onClose, onLogout, navigate, t }) {
  const { updateProfile } = useAppContext();
  const [editName,   setEditName]   = useState(false);
  const [nameVal,    setNameVal]    = useState(currentUser.name || '');
  const [pickerOpen, setPickerOpen] = useState(false);

  const saveName = () => {
    if (nameVal.trim()) { updateProfile({ name: nameVal.trim() }); toast.success('Name updated!'); }
    setEditName(false); onClose();
  };

  return (
    <>
      <motion.div initial={{opacity:0,scale:0.95,y:-8}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.95,y:-8}} transition={{duration:0.15}}
        className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[hsl(222,24%,11%)] rounded-2xl shadow-2xl border border-gray-200 dark:border-[hsl(222,18%,22%)] overflow-visible z-50"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[hsl(222,30%,14%)] dark:to-[hsl(235,25%,16%)] border-b border-gray-100 dark:border-[hsl(222,18%,18%)] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => setPickerOpen(true)}>
              <AvatarCircle user={currentUser} size={48} className="ring-2 ring-white shadow-md"/>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-4 h-4 text-white"/>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {editName
                ? <div className="flex gap-1">
                    <input value={nameVal} onChange={e => setNameVal(e.target.value)}
                      onKeyDown={e => { if (e.key==='Enter') saveName(); if (e.key==='Escape') setEditName(false); }}
                      className="flex-1 text-sm font-semibold border-b border-blue-400 outline-none bg-transparent text-gray-900 dark:text-gray-100 min-w-0" autoFocus/>
                    <button onClick={saveName} className="text-green-600"><Check className="w-4 h-4"/></button>
                  </div>
                : <button onClick={() => setEditName(true)}
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate block w-full text-left hover:text-blue-600 transition-colors">
                    {currentUser.name || 'Set your name'}
                  </button>
              }
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="p-2">
          <button onClick={() => { onClose(); navigate('/settings'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[hsl(222,25%,16%)] hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-colors">
            <Settings className="w-4 h-4 text-gray-400"/>Settings & preferences
          </button>
          <button onClick={() => setPickerOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[hsl(222,25%,16%)] hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-colors">
            <Camera className="w-4 h-4 text-gray-400"/>Change profile photo
          </button>
          <hr className="my-1.5 border-gray-100 dark:border-[hsl(222,18%,18%)]"/>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut className="w-4 h-4"/>{t('nav.signOut')}
          </button>
        </div>
      </motion.div>
      <AvatarPicker currentAvatar={currentUser.avatar} userName={currentUser.name}
        userEmail={currentUser.email} open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={data => {
          updateProfile({ avatar: data });
          toast.success(data ? 'Photo updated!' : 'Photo removed');
          setPickerOpen(false); onClose();
        }}
      />
    </>
  );
}

// ── Mobile drawer menu ────────────────────────────────────────────────────────
function MobileMenu({ open, onClose, isLoggedIn, currentUser, health, isActive, handleLogout, toggleDark, isDark, setPaletteOpen, navigate, t }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}/>
          {/* Drawer */}
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}
            transition={{type:'spring',stiffness:300,damping:30}}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[90vw] bg-white dark:bg-[hsl(222,26%,10%)] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[hsl(222,18%,18%)]">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="" className="w-8 h-8 object-contain rounded-lg"/>
                <span className="font-bold text-base"><span className="text-blue-600 dark:text-blue-400">CAIE</span><span className="text-red-500 dark:text-red-400 ml-1">Scholar</span></span>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
              </button>
            </div>

            {/* User card */}
            {isLoggedIn && currentUser && (
              <div className="mx-4 my-3 p-3 bg-blue-50 dark:bg-[hsl(222,30%,14%)] rounded-2xl flex items-center gap-3">
                <AvatarCircle user={currentUser} size={44} className="ring-2 ring-white shadow flex-shrink-0"/>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{currentUser.name || currentUser.email.split('@')[0]}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                </div>
              </div>
            )}

            {/* Backend status */}
            <div className={`mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
              health ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                     : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${health?'bg-green-500 animate-pulse':'bg-red-400'}`}/>
              Backend: {health ? `live · ${health.local_papers} papers` : 'offline'}
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-0.5">
              {TOP_NAV.map(({ name, path, icon: Icon }) => (
                <button key={name} onClick={() => { navigate(path); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[hsl(222,22%,16%)]'
                  }`}>
                  <Icon className="w-4 h-4 flex-shrink-0"/>{name}
                  {isActive(path) && <ChevronRight className="w-4 h-4 ml-auto opacity-70"/>}
                </button>
              ))}

              <div className="h-px bg-gray-100 dark:bg-[hsl(222,18%,18%)] my-2"/>

              <button onClick={() => { navigate('/settings'); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[hsl(222,22%,16%)] transition-colors">
                <Settings className="w-4 h-4"/>{t('settings.title')}
              </button>
              <button onClick={() => { setPaletteOpen(true); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[hsl(222,22%,16%)] transition-colors">
                <Command className="w-4 h-4"/>Command palette
                <span className="ml-auto text-xs text-gray-400 font-mono">⌘K</span>
              </button>
              <button onClick={toggleDark}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[hsl(222,22%,16%)] transition-colors">
                <span className="w-4 h-4 flex items-center justify-center">{isDark ? '☀️' : '🌙'}</span>
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-gray-100 dark:border-[hsl(222,18%,18%)]">
              {isLoggedIn ? (
                <button onClick={() => { handleLogout(); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut className="w-4 h-4"/>{t('nav.signOut')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { navigate('/login'); onClose(); }}
                    className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {t('nav.signIn')}
                  </button>
                  <button onClick={() => { navigate('/signup'); onClose(); }}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold transition-all hover:opacity-90">
                    {t('nav.signUp')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Mobile Bottom Tab Bar ─────────────────────────────────────────────────────
function BottomTabBar({ isActive }) {
  const navigate = useNavigate();
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-[hsl(222,26%,10%)] border-t border-gray-200 dark:border-[hsl(222,18%,18%)] safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1" style={{paddingBottom:'env(safe-area-inset-bottom,8px)'}}>
        {BOTTOM_TABS.map(({ name, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button key={path} onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-w-0 relative">
              {active && (
                <motion.div layoutId="bottomTabIndicator"
                  className="absolute -top-px inset-x-2 h-0.5 bg-blue-600 rounded-full"
                  transition={{type:'spring',stiffness:380,damping:30}}/>
              )}
              <Icon className={`w-5 h-5 transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}/>
              <span className={`text-[10px] font-semibold transition-colors truncate max-w-full px-0.5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { t }     = useI18n();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [isDark,      setIsDark]      = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isLoggedIn, currentUser, logout } = useAppContext();

  useEffect(() => {
    const dark = localStorage.getItem('darkMode') === 'true';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('darkMode', next);
    document.documentElement.classList.toggle('dark', next);
  };

  // Close profile on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const h = (e) => { setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [profileOpen]);

  // ⌘K shortcut
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); setPaletteOpen(p=>!p); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const { data: health } = useQuery({
    queryKey: ['backendHealth'], queryFn: pingBackend,
    refetchInterval: 30_000, retry: false, staleTime: 20_000,
  });

  const isActive = (path) =>
    path === '/' ? location.pathname==='/'||location.pathname==='/Home'
                 : location.pathname === path;

  const sideLinks = SIDE_NAV[location.pathname] || [];
  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };

  return (
    <>
      <SelectionReader/>
      <PageProgress/>
      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[500] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:font-bold">
        Skip to main content
      </a>

      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <nav role="navigation" aria-label="Main navigation"
        className="bg-white dark:bg-[hsl(222,26%,10%)] border-b border-gray-200 dark:border-[hsl(222,18%,18%)] sticky top-0 z-50 shadow-sm">
        <div className="px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="CAIE Scholar" className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg"/>
            <div className="leading-tight">
              <span className="text-base font-bold text-blue-700 dark:text-blue-400 tracking-tight">CAIE</span>
              <span className="text-base font-bold text-red-500 dark:text-red-400 tracking-tight ml-1">Scholar</span>
            </div>
            {/* Backend pill — desktop only */}
            {health !== undefined && (
              <span className={`hidden lg:inline-flex items-center gap-1 ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                health ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                       : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${health?'bg-green-500 animate-pulse':'bg-red-400'}`}/>
                {health ? `${health.local_papers} papers` : 'offline'}
              </span>
            )}
          </Link>

          {/* Desktop nav pills */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {TOP_NAV.map(({ name, path, icon: Icon }) => (
              <Link key={name} to={path}>
                <button className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm shadow-blue-900/25'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[hsl(222,22%,16%)] hover:text-gray-900 dark:hover:text-white'
                }`}>
                  <Icon className="w-4 h-4 flex-shrink-0"/>
                  <span className="hidden lg:inline">{name}</span>
                </button>
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Desktop-only extras */}
            <div className="hidden md:flex items-center gap-1.5">
              <KeyboardShortcuts/>
              <button onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Command className="w-3.5 h-3.5"/><span className="hidden lg:inline font-mono">⌘K</span>
              </button>
              <button onClick={toggleDark} title={isDark ? 'Light mode' : 'Dark mode'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link to="/settings">
                <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive('/settings') ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <Settings className="w-4 h-4"/>
                </button>
              </Link>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700"/>
            </div>

            {/* Profile / auth */}
            {isLoggedIn && currentUser ? (
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <button onClick={() => setProfileOpen(p=>!p)}
                  className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-1.5 py-1 transition-colors">
                  <AvatarCircle user={currentUser} size={30} className="ring-2 ring-blue-200 dark:ring-blue-800"/>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden xl:block max-w-[72px] truncate">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <ProfileDropdown currentUser={currentUser}
                      onClose={() => setProfileOpen(false)}
                      onLogout={handleLogout}
                      navigate={navigate}
                      t={t}
                    />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Link to="/login"><Button variant="ghost" size="sm" className="text-xs dark:text-gray-300">{t('nav.signIn')}</Button></Link>
                <Link to="/signup"><Button size="sm" className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs">{t('nav.signUp')}</Button></Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open menu">
              {isLoggedIn && currentUser
                ? <AvatarCircle user={currentUser} size={28} className="ring-2 ring-blue-200"/>
                : <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300"/>}
            </button>
          </div>
        </div>

        {/* Sub-nav for hub pages */}
        {sideLinks.length > 0 && (
          <div className="border-t border-gray-100 dark:border-[hsl(222,18%,16%)] bg-gray-50/80 dark:bg-[hsl(222,24%,9%)] px-4 sm:px-6">
            <div className="flex items-center gap-0.5 overflow-x-auto py-1.5 scrollbar-hide">
              {sideLinks.map(({ label, tab, icon: Icon }) => (
                <button key={tab}
                  onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab } }))}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[hsl(222,22%,14%)] hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-sm">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0"/>{label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile slide-out menu */}
      <MobileMenu
        open={menuOpen} onClose={() => setMenuOpen(false)}
        isLoggedIn={isLoggedIn} currentUser={currentUser}
        health={health} isActive={isActive}
        handleLogout={handleLogout} toggleDark={toggleDark} isDark={isDark}
        setPaletteOpen={setPaletteOpen} navigate={navigate} t={t}
      />

      {/* Page content — padded bottom on mobile for tab bar */}
      <main id="main-content" className="min-h-screen bg-background dark:bg-[hsl(222,28%,8%)] pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <BottomTabBar isActive={isActive}/>

      <BackToTop/>

      {/* Footer */}
      <footer className="hidden md:block bg-gray-900 dark:bg-[hsl(222,30%,6%)] text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="CAIE Scholar" className="w-8 h-8 object-contain rounded-lg"/>
              <span className="font-bold text-white"><span className="text-blue-400">CAIE</span><span className="text-red-400 ml-1">Scholar</span></span>
            </div>
            <p className="text-sm leading-relaxed">Cambridge IGCSE, AS & A-Level, and O-Level past papers with AI study notes and a built-in study timer.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Levels</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/AcademicHub" className="hover:text-white transition-colors">IGCSE</Link></li>
              <li><Link to="/ASLevelHub"  className="hover:text-white transition-colors">AS & A-Level</Link></li>
              <li><Link to="/OLevelHub"   className="hover:text-white transition-colors">O-Level</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Tools</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/settings" className="hover:text-white transition-colors flex items-center gap-1.5"><Settings className="w-3.5 h-3.5"/>Settings</Link></li>
              <li><a href={`${API}/docs`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">API docs →</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-6 text-center text-sm">
          © {new Date().getFullYear()} <span className="text-blue-400">CAIE</span><span className="text-red-400"> Scholar</span>
        </div>
      </footer>

      <AnimatePresence>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)}/>}
      </AnimatePresence>
    </>
  );
}
