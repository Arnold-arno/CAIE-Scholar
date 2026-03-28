/**
 * Settings.jsx — Account, appearance, notifications, read-aloud preferences
 */
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Moon, Sun, Volume2, Trash2, Save, Camera,
  Shield, Globe, ChevronRight, CheckCircle, RotateCcw, Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarCircle from '@/components/ui/avatar';
import AvatarPicker from '@/components/ui/avatar-picker';
import { useAppContext } from '@/context/AppContext';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useI18n, LANGUAGES } from '@/context/I18nContext';
import { toast } from 'sonner';

const SECTION = ({ id, icon: Icon, title, children }) => (
  <motion.div id={id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[hsl(222,24%,11%)] rounded-2xl border border-gray-200 dark:border-[hsl(222,18%,20%)] shadow-sm overflow-hidden mb-5">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 dark:border-[hsl(222,18%,18%)] bg-gray-50 dark:bg-[hsl(222,22%,13%)]">
      <Icon className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h2>
    </div>
    <div className="px-6 py-5">{children}</div>
  </motion.div>
);

const ROW = ({ label, hint, children }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-gray-100 dark:border-[hsl(222,18%,18%)] last:border-0 gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)}
    className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const VOICE_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
const VOICE_LABELS = { 0.75: 'Slow', 1: 'Normal', 1.25: 'Fast', 1.5: 'Faster', 1.75: 'Very fast', 2: 'Max' };

export default function Settings() {
  const {
    currentUser, updateProfile, logout,
    weeklyGoal, setWeeklyGoal,
    clearNotesHistory, clearHistory,
  } = useAppContext();

  const [nameVal,      setNameVal]      = useState(currentUser?.name  || '');
  const [emailVal,     setEmailVal]     = useState(currentUser?.email || '');
  const [pickerOpen,   setPickerOpen]   = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [goalVal,      setGoalVal]      = useState(String(weeklyGoal));

  // Preferences stored in localStorage
  const [darkMode,     setDarkModeState] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [notifEnabled, setNotifEnabled]  = useState(() => 'Notification' in window && Notification.permission === 'granted');
  const [readSpeed,    setReadSpeed]     = useState(() => parseFloat(localStorage.getItem('readSpeed') || '1'));
  const [readVoice,    setReadVoice]     = useState(() => localStorage.getItem('readVoice') || '');
  const [autoRead,     setAutoRead]      = useState(() => localStorage.getItem('autoRead') === 'true');
  const [voices,       setVoices]        = useState(() => {
    if (!('speechSynthesis' in window)) return [];
    const load = () => {
      const vs = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(vs);
    };
    window.speechSynthesis.onvoiceschanged = load;
    return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
  });

  const saveProfile = () => {
    if (!nameVal.trim()) { toast.error('Name cannot be empty'); return; }
    updateProfile({ name: nameVal.trim(), email: emailVal.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success('Profile saved');
  };

  const toggleDark = (on) => {
    setDarkModeState(on);
    localStorage.setItem('darkMode', on);
    document.documentElement.classList.toggle('dark', on);
  };

  const toggleNotif = async () => {
    if (!('Notification' in window)) { toast.error('Notifications not supported'); return; }
    if (Notification.permission === 'granted') {
      toast.info('To disable, use your browser notification settings');
    } else {
      const result = await Notification.requestPermission();
      setNotifEnabled(result === 'granted');
      if (result === 'granted') toast.success('Notifications enabled');
      else toast.error('Notifications denied');
    }
  };

  const saveReadPrefs = () => {
    localStorage.setItem('readSpeed', readSpeed);
    localStorage.setItem('readVoice', readVoice);
    localStorage.setItem('autoRead', autoRead);
    toast.success('Read-aloud preferences saved');
  };

  const testVoice = () => {
    if (!('speechSynthesis' in window)) { toast.error('Speech not supported in this browser'); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance('This is a test of the CAIE Scholar read-aloud feature.');
    utt.rate = readSpeed;
    if (readVoice) {
      const v = window.speechSynthesis.getVoices().find(v => v.name === readVoice);
      if (v) utt.voice = v;
    }
    window.speechSynthesis.speak(utt);
  };

  const saveGoal = () => {
    const v = Math.max(30, Math.min(2100, parseInt(goalVal) || 300));
    setWeeklyGoal(v);
    setGoalVal(String(v));
    toast.success('Weekly goal updated');
  };

  const sections = [
    { id: 'profile',    label: t('settings.profile'),    icon: User },
    { id: 'language',   label: t('settings.language'),   icon: Globe },
    { id: 'appearance', label: t('settings.appearance'),  icon: darkMode ? Moon : Sun },
    { id: 'readaloud',  label: 'Read Aloud',   icon: Volume2 },
    { id: 'study',      label: 'Study',        icon: CheckCircle },
    { id: 'notifs',     label: 'Notifications',icon: Bell },
    { id: 'data',       label: 'Data',         icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[hsl(222,28%,8%)]">
      <ConfirmUI />
      {/* Page header */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-blue-200 text-sm">Account, appearance, read-aloud and study preferences</p>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-8">
        {/* Sticky side nav */}
        <aside className="hidden lg:block w-44 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[hsl(222,24%,13%)] hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
                <s.icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Profile ── */}
          <SECTION id="profile" icon={User} title="Profile">
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100 dark:border-[hsl(222,18%,18%)]">
              <div className="relative cursor-pointer group" onClick={() => setPickerOpen(true)}>
                <AvatarCircle user={currentUser} size={72} className="ring-4 ring-white dark:ring-[hsl(222,24%,14%)] shadow-lg" />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{currentUser?.name || 'Set your name'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
                <button onClick={() => setPickerOpen(true)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1">
                  Change profile photo
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Display name</Label>
                <Input value={nameVal} onChange={e => setNameVal(e.target.value)}
                  placeholder="Your name"
                  className="border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Email address</Label>
                <Input type="email" value={emailVal} onChange={e => setEmailVal(e.target.value)}
                  placeholder="you@example.com"
                  className="border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl" />
                <p className="text-xs text-gray-400 mt-1">Used for display only — no emails are sent</p>
              </div>
              <Button onClick={saveProfile}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-2">
                {saved ? <><CheckCircle className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save profile</>}
              </Button>
            </div>
            <AvatarPicker
              currentAvatar={currentUser?.avatar} userName={currentUser?.name}
              userEmail={currentUser?.email} open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onSave={data => { updateProfile({ avatar: data }); toast.success(data ? 'Photo updated' : 'Photo removed'); setPickerOpen(false); }}
            />
          </SECTION>

          {/* ── Language ── */}
          <SECTION id="language" icon={Globe} title={t('settings.language')}>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choose your preferred language for the app interface. AI-generated content will adapt to your topic language automatically.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-left transition-all ${
                    lang === l.code
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                      : 'border-gray-200 dark:border-[hsl(222,18%,22%)] hover:border-gray-300 dark:hover:border-[hsl(222,18%,28%)]'
                  }`}>
                  <span className="text-xl leading-none">{l.flag}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${lang === l.code ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                      {l.nativeName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{l.name}</p>
                  </div>
                  {lang === l.code && <CheckCircle className="w-4 h-4 text-blue-500 ml-auto flex-shrink-0"/>}
                </button>
              ))}
            </div>
            {lang === 'ar' && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                ℹ Right-to-left layout applied. Some complex UI components may still display left-to-right.
              </p>
            )}
          </SECTION>

          {/* ── Appearance ── */}
          <SECTION id="appearance" icon={darkMode ? Moon : Sun} title={t('settings.appearance')}>
            <ROW label={t('settings.darkMode')} hint="Reduces eye strain in low-light environments">
              <Toggle on={darkMode} onChange={toggleDark} />
            </ROW>
          </SECTION>

          {/* ── Read Aloud ── */}
          <SECTION id="readaloud" icon={Volume2} title="Read Aloud">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Select any text in the app and press the <kbd className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">🔊</kbd> toolbar, or use the Read Aloud button on search results and AI notes.
            </p>
            <ROW label="Auto-read new results" hint="Reads result titles aloud after each search">
              <Toggle on={autoRead} onChange={setAutoRead} />
            </ROW>
            <ROW label="Reading speed" hint={`Currently: ${VOICE_LABELS[readSpeed] || readSpeed + '×'}`}>
              <select value={readSpeed} onChange={e => setReadSpeed(parseFloat(e.target.value))}
                className="px-3 py-1.5 border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl text-sm bg-white dark:bg-[hsl(222,22%,13%)] text-gray-800 dark:text-gray-200">
                {VOICE_RATES.map(r => <option key={r} value={r}>{VOICE_LABELS[r]} ({r}×)</option>)}
              </select>
            </ROW>
            {voices.length > 0 && (
              <ROW label="Voice" hint="English voices available on this device">
                <select value={readVoice} onChange={e => setReadVoice(e.target.value)}
                  className="max-w-[220px] px-3 py-1.5 border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl text-sm bg-white dark:bg-[hsl(222,22%,13%)] text-gray-800 dark:text-gray-200">
                  <option value="">System default</option>
                  {voices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                </select>
              </ROW>
            )}
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={testVoice} className="gap-2 rounded-xl border-2">
                <Volume2 className="w-4 h-4" />Test voice
              </Button>
              <Button onClick={saveReadPrefs} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-2">
                <Save className="w-4 h-4" />Save preferences
              </Button>
            </div>
          </SECTION>

          {/* ── Study preferences ── */}
          <SECTION id="study" icon={CheckCircle} title="Study Preferences">
            <ROW label="Weekly study goal" hint="Target minutes per week shown in the timer">
              <div className="flex items-center gap-2">
                <Input type="number" min="30" max="2100" step="30" value={goalVal}
                  onChange={e => setGoalVal(e.target.value)}
                  className="w-24 border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl text-sm" />
                <span className="text-sm text-gray-500">min / week</span>
                <Button size="sm" onClick={saveGoal} className="rounded-xl bg-blue-600 text-white">Save</Button>
              </div>
            </ROW>
          </SECTION>

          {/* ── Notifications ── */}
          <SECTION id="notifs" icon={Bell} title="Notifications">
            <ROW label="Study timer alerts" hint="Desktop notification when a Pomodoro session ends">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  notifEnabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                               : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {notifEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <Button size="sm" variant="outline" onClick={toggleNotif} className="rounded-xl border-2 text-xs">
                  {notifEnabled ? 'Manage in browser' : 'Enable'}
                </Button>
              </div>
            </ROW>
          </SECTION>

          {/* ── Data ── */}
          <SECTION id="data" icon={Trash2} title="Data & Privacy">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              All your data is stored only in your browser's localStorage. Nothing is sent to any server.
            </p>
            <ROW label="Clear search history" hint="Removes recent searches from all levels">
              <Button size="sm" variant="outline"
                onClick={async() => { const yes = await confirm({ title: 'Clear search history?', message: 'This will permanently remove all recent searches across IGCSE, AS & A-Level, and O-Level.', confirmLabel: t('confirm.clear'), danger: true }); if (yes) { ['IGCSE','AS_LEVEL','O_LEVEL'].forEach(l => clearHistory(l)); toast.success('Search history cleared'); } }}
                className="rounded-xl border-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />Clear history
              </Button>
            </ROW>
            <ROW label="Clear AI notes history" hint="Removes all saved notes sessions">
              <Button size="sm" variant="outline"
                onClick={async() => { const yes = await confirm({ title: 'Clear notes history?', message: 'All 20 saved AI notes sessions will be permanently deleted. This cannot be undone.', confirmLabel: t('confirm.clear'), danger: true }); if (yes) { clearNotesHistory(); toast.success('Notes history cleared'); } }}
                className="rounded-xl border-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />Clear notes
              </Button>
            </ROW>
            <ROW label="Sign out" hint="You will be returned to the home page">
              <Button size="sm" variant="outline" onClick={async() => { const yes = await confirm({ title: 'Sign out?', message: 'You will be returned to the home page. Your data stays saved in this browser.', confirmLabel: t('confirm.signOut'), danger: false }); if (yes) logout(); }}
                className="rounded-xl border-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs gap-1.5">
                Sign out
              </Button>
            </ROW>
          </SECTION>

        </div>
      </div>
    </div>
  );
}
