import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Book, Menu, Activity, Search, LogOut, Command, Camera, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import AvatarCircle from '@/components/ui/avatar';
import AvatarPicker from '@/components/ui/avatar-picker';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function pingBackend() {
  try {
    const r = await fetch(`${API}/api/health`, { signal: AbortSignal.timeout(3000) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}

const NAV = [
  { name: 'Home',         path: '/',              icon: Home, alias: null },
  { name: 'IGCSE',        path: '/AcademicSuite', icon: Book, alias: 'O-Level equiv.' },
  { name: 'AS & A-Level', path: '/ASLevelSuite',  icon: Book, alias: 'Advanced' },
  { name: 'O-Level',      path: '/OLevelSuite',   icon: Book, alias: 'Cambridge O' },
];

// ── Command Palette ───────────────────────────────────────────────────────────
const COMMANDS = [
  { label: 'Go to Home',            path: '/',              icon: Home,     group: 'Navigate' },
  { label: 'Go to IGCSE',           path: '/AcademicSuite', icon: Book,     group: 'Navigate' },
  { label: 'Go to AS & A-Level',    path: '/ASLevelSuite',  icon: Book,     group: 'Navigate' },
  { label: 'Go to O-Level',         path: '/OLevelSuite',   icon: Book,     group: 'Navigate' },
  { label: 'IGCSE — Past Papers',   path: '/AcademicSuite', icon: Search,   group: 'Quick jump' },
  { label: 'A-Level — Past Papers', path: '/ASLevelSuite',  icon: Search,   group: 'Quick jump' },
  { label: 'O-Level — Past Papers', path: '/OLevelSuite',   icon: Search,   group: 'Quick jump' },
  { label: 'API Documentation',     path: null, url: `${API}/docs`, icon: Activity, group: 'Tools' },
];

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
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}>
      <motion.div initial={{opacity:0,scale:0.95,y:-10}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.95,y:-10}} transition={{duration:0.15}}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search commands…"
            className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400" />
          <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto pb-2">
          {groups.map(group => (
            <div key={group}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">{group}</p>
              {filtered.filter(c => c.group === group).map((cmd) => {
                const idx = filtered.indexOf(cmd);
                return (
                  <button key={cmd.label} onClick={() => execute(cmd)} onMouseEnter={() => setSel(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      sel === idx ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                    <cmd.icon className={`w-4 h-4 flex-shrink-0 ${sel === idx ? 'text-blue-500' : 'text-gray-400'}`} />
                    {cmd.label}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No commands match "{q}"</div>}
        </div>
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
          <span><kbd className="bg-gray-100 px-1 rounded">↑↓</kbd> Navigate</span>
          <span><kbd className="bg-gray-100 px-1 rounded">↵</kbd> Open</span>
          <span><kbd className="bg-gray-100 px-1 rounded">Esc</kbd> Close</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ currentUser, onClose, onLogout }) {
  const { updateProfile } = useAppContext();
  const [editName,    setEditName]    = useState(false);
  const [nameVal,     setNameVal]     = useState(currentUser.name || '');
  const [pickerOpen,  setPickerOpen]  = useState(false);

  const saveName = () => {
    if (nameVal.trim()) { updateProfile({ name: nameVal.trim() }); toast.success('Name updated!'); }
    setEditName(false);
    onClose();
  };

  return (
    <>
      <motion.div initial={{opacity:0,scale:0.95,y:-8}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.95,y:-8}} transition={{duration:0.15}}
        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Clickable avatar opens picker */}
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => setPickerOpen(true)}>
              <AvatarCircle user={currentUser} size={48} className="ring-2 ring-white shadow-md" />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {editName
                ? <div className="flex gap-1">
                    <input value={nameVal} onChange={e => setNameVal(e.target.value)}
                      onKeyDown={e => { if (e.key==='Enter') saveName(); if (e.key==='Escape') setEditName(false); }}
                      className="flex-1 text-sm font-semibold border-b border-blue-400 outline-none bg-transparent text-gray-900 min-w-0"
                      autoFocus />
                    <button onClick={saveName} className="text-green-600 hover:text-green-700 flex-shrink-0">
                      <Check className="w-4 h-4"/>
                    </button>
                  </div>
                : <button onClick={() => setEditName(true)}
                    className="text-sm font-semibold text-gray-900 truncate block w-full text-left hover:text-blue-600 transition-colors">
                    {currentUser.name || 'Set your name'}
                  </button>
              }
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Click avatar or name to edit</p>
        </div>

        {/* Actions */}
        <div className="p-2">
          <button onClick={() => setPickerOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
            <Camera className="w-4 h-4 text-gray-400"/>Change profile photo
          </button>
          <hr className="my-1.5 border-gray-100"/>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4"/>Sign out
          </button>
        </div>
      </motion.div>

      {/* Avatar picker modal — rendered outside the dropdown so it doesn't get clipped */}
      <AvatarPicker
        currentAvatar={currentUser.avatar}
        userName={currentUser.name}
        userEmail={currentUser.email}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={(data) => {
          updateProfile({ avatar: data });
          toast.success(data ? 'Profile photo updated!' : 'Profile photo removed');
          setPickerOpen(false);
          onClose();
        }}
      />
    </>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [isDark,        setIsDark]        = useState(false);
  const [paletteOpen,   setPaletteOpen]   = useState(false);
  const [profileOpen,   setProfileOpen]   = useState(false);

  const { isLoggedIn, currentUser, logout } = useAppContext();

  useEffect(() => {
    const dark = localStorage.getItem('darkMode') === 'true';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const h = () => setProfileOpen(false);
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [profileOpen]);

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(p => !p); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const { data: health } = useQuery({
    queryKey: ['backendHealth'], queryFn: pingBackend,
    refetchInterval: 30_000, retry: false, staleTime: 20_000,
  });

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' || location.pathname === '/Home' : location.pathname === path;

  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/'); };

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt="CAIE Scholar" className="w-9 h-9 object-contain rounded-lg" />
            <div className="hidden sm:block leading-tight">
              <span className="text-base font-bold text-blue-700 dark:text-blue-400 tracking-tight">CAIE</span>
              <span className="text-base font-bold text-red-500 dark:text-red-400 tracking-tight ml-1">Scholar</span>
              {health !== undefined && (
                <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  health ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                         : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                  {health ? `${health.local_papers} papers` : 'offline'}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV.map(({ name, path, icon: Icon, alias }) => (
              <Link key={name} to={path}>
                <Button variant={isActive(path) ? 'default' : 'ghost'} size="sm"
                  className={isActive(path)
                    ? 'bg-gradient-to-r from-blue-700 to-red-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}>
                  <Icon className="w-4 h-4 mr-1.5" />{name}
                  {alias && <span className="ml-1 text-[10px] opacity-60">({alias})</span>}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            {/* Command palette */}
            <Button variant="ghost" size="sm" onClick={() => setPaletteOpen(true)}
              className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 gap-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5">
              <Command className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">⌘K</span>
            </Button>

            {/* Dark mode */}
            <Button variant="ghost" size="sm" onClick={() => {
              const next = !isDark;
              setIsDark(next);
              localStorage.setItem('darkMode', next);
              document.documentElement.classList.toggle('dark', next);
            }} className="text-gray-500 dark:text-gray-400">
              {isDark ? '☀' : '☾'}
            </Button>

            {/* Auth / Profile */}
            {isLoggedIn && currentUser ? (
              <div className="relative ml-1" onMouseDown={e => e.stopPropagation()}>
                <button
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-2 py-1.5 transition-colors"
                  title="Profile">
                  <AvatarCircle user={currentUser} size={32} className="ring-2 ring-blue-200 dark:ring-blue-800" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 hidden lg:block max-w-[100px] truncate">
                    {currentUser.name || currentUser.email.split('@')[0]}
                  </span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <ProfileDropdown
                      currentUser={currentUser}
                      onClose={() => setProfileOpen(false)}
                      onLogout={handleLogout}
                    />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 ml-1">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 text-xs">Sign in</Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {isLoggedIn && currentUser
                  ? <AvatarCircle user={currentUser} size={32} className="ring-2 ring-blue-200" />
                  : <Menu className="w-5 h-5" />
                }
              </Button>
            </SheetTrigger>
            <SheetContent className="dark:bg-gray-900 dark:text-white">
              {isLoggedIn && currentUser ? (
                <div className="flex items-center gap-3 mb-6 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <AvatarCircle user={currentUser} size={44} className="ring-2 ring-white shadow-md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {currentUser.name || currentUser.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-6 mt-2">
                  <img src="/logo.png" alt="CAIE Scholar" className="w-10 h-10 object-contain rounded-lg" />
                  <span className="text-lg font-bold">
                    <span className="text-blue-700 dark:text-blue-400">CAIE</span>
                    <span className="text-red-500 dark:text-red-400 ml-1">Scholar</span>
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium mb-3 ${
                  health ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                         : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  Backend: {health ? `live · ${health.local_papers} papers` : 'offline'}
                </div>
                {NAV.map(({ name, path, icon: Icon, alias }) => (
                  <Link key={name} to={path} onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start dark:text-gray-300">
                      <Icon className="w-4 h-4 mr-2" />{name}
                      {alias && <span className="ml-1.5 text-xs text-gray-400">({alias})</span>}
                    </Button>
                  </Link>
                ))}
                <hr className="my-1.5 border-gray-200 dark:border-gray-700" />
                <Button variant="ghost" onClick={() => { setPaletteOpen(true); setMenuOpen(false); }}
                  className="w-full justify-start gap-2 text-gray-500 dark:text-gray-400">
                  <Command className="w-4 h-4" />Command palette
                </Button>
                {isLoggedIn
                  ? <Button variant="ghost" onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="w-full justify-start gap-2 text-red-400 hover:text-red-600">
                      <LogOut className="w-4 h-4" />Sign out
                    </Button>
                  : <>
                      <Link to="/login"  onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Sign in</Button></Link>
                      <Link to="/signup" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Sign up</Button></Link>
                    </>
                }
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <main className="min-h-screen dark:bg-gray-950 transition-colors">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="CAIE Scholar" className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-bold text-white">
                <span className="text-blue-400">CAIE</span><span className="text-red-400 ml-1">Scholar</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">Cambridge IGCSE, AS & A-Level, and O-Level past papers with mark schemes, AI study notes, and a study timer.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Examination levels</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/AcademicSuite" className="hover:text-white">IGCSE <span className="text-gray-600 text-xs">(O-Level equivalent)</span></Link></li>
              <li><Link to="/ASLevelSuite"  className="hover:text-white">AS & A-Level <span className="text-gray-600 text-xs">(Advanced Level)</span></Link></li>
              <li><Link to="/OLevelSuite"   className="hover:text-white">O-Level <span className="text-gray-600 text-xs">(Cambridge O Level)</span></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Tools</h4>
            <ul className="space-y-1.5 text-sm">
              <li>
                <button onClick={() => setPaletteOpen(true)} className="hover:text-white flex items-center gap-1.5">
                  <Command className="w-3.5 h-3.5" />Command palette <kbd className="text-gray-600 text-xs ml-1">⌘K</kbd>
                </button>
              </li>
              <li><a href={`${API}/docs`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors">API Documentation →</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} <span className="text-blue-400">CAIE</span><span className="text-red-400"> Scholar</span> — Cambridge examination companion</p>
        </div>
      </footer>

      <AnimatePresence>
        {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
