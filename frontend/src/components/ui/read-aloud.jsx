/**
 * ReadAloud — floating toolbar + hook for text-to-speech anywhere in the app.
 *
 * Usage:
 *   1. Wrap any section in <ReadAloudZone label="Results">...</ReadAloudZone>
 *   2. The user sees a 🔊 button. Clicking it reads the zone's text aloud.
 *   3. A floating mini-toolbar appears while reading (pause/resume/stop/speed).
 *
 * Also: selectedText read-aloud — user selects text → floating "Read aloud" button appears.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Pause, Play, X, ChevronDown } from 'lucide-react';

// ── Speech state singleton (one utterance at a time) ─────────────────────────
let _currentZone = null;

function getPrefs() {
  return {
    rate:  parseFloat(localStorage.getItem('readSpeed') || '1'),
    voice: localStorage.getItem('readVoice') || '',
  };
}

function speak(text, onWord, onEnd) {
  if (!('speechSynthesis' in window)) { alert('Speech synthesis not supported in this browser.'); return null; }
  window.speechSynthesis.cancel();
  const utt   = new SpeechSynthesisUtterance(text);
  const prefs = getPrefs();
  utt.rate    = prefs.rate;
  if (prefs.voice) {
    const v = window.speechSynthesis.getVoices().find(v => v.name === prefs.voice);
    if (v) utt.voice = v;
  }
  if (onWord) utt.onboundary = (e) => { if (e.name === 'word') onWord(e.charIndex, e.charLength); };
  utt.onend  = onEnd || (() => {});
  utt.onerror = () => {};
  window.speechSynthesis.speak(utt);
  return utt;
}

// ── Floating mini player ──────────────────────────────────────────────────────
function ReadingBar({ label, onStop, rate, onRateChange }) {
  const [paused, setPaused] = useState(false);
  const toggle = () => {
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else        { window.speechSynthesis.pause();  setPaused(true);  }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-2.5 text-sm select-none"
    >
      <Volume2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
      <span className="max-w-[160px] truncate text-xs text-gray-300">{label}</span>
      <button onClick={toggle} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
        {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
      </button>
      <select value={rate} onChange={e => onRateChange(parseFloat(e.target.value))}
        className="bg-white/10 text-white text-xs rounded-lg px-1.5 py-1 border-none outline-none appearance-none cursor-pointer">
        {[0.75,1,1.25,1.5,1.75,2].map(r => <option key={r} value={r} className="text-black">{r}×</option>)}
      </select>
      <button onClick={onStop} className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/30 flex items-center justify-center transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── ReadAloudZone — wrap any section ──────────────────────────────────────────
export function ReadAloudZone({ children, label = 'Content', className = '' }) {
  const [active,  setActive]  = useState(false);
  const [rate,    setRate]    = useState(() => parseFloat(localStorage.getItem('readSpeed') || '1'));
  const zoneRef               = useRef(null);
  const id                    = useRef(`raz-${Math.random().toString(36).slice(2)}`).current;

  const getText = () => zoneRef.current?.innerText || '';

  const start = () => {
    const text = getText().trim();
    if (!text) return;
    if (_currentZone && _currentZone !== id) { window.speechSynthesis.cancel(); }
    _currentZone = id;
    setActive(true);
    speak(text, null, () => { setActive(false); _currentZone = null; });
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setActive(false);
    _currentZone = null;
  };

  const handleRateChange = (r) => {
    setRate(r);
    localStorage.setItem('readSpeed', r);
    // Restart with new rate
    if (active) { stop(); setTimeout(() => start(), 80); }
  };

  return (
    <div ref={zoneRef} className={`relative group ${className}`}>
      {/* 🔊 trigger button — appears on hover */}
      <button
        onClick={active ? stop : start}
        title={active ? 'Stop reading' : `Read aloud: ${label}`}
        className={`absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-xs transition-all
          ${active
            ? 'bg-blue-600 text-white opacity-100 scale-110'
            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100'
          }`}>
        {active ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>

      {children}

      <AnimatePresence>
        {active && <ReadingBar label={label} onStop={stop} rate={rate} onRateChange={handleRateChange} />}
      </AnimatePresence>
    </div>
  );
}

// ── SelectionReader — floating "Read aloud" on text selection ─────────────────
export function SelectionReader() {
  const [pos,   setPos]   = useState(null);
  const [text,  setText]  = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onSelect = () => {
      const sel = window.getSelection();
      const t   = sel?.toString().trim();
      if (!t || t.length < 3) { setPos(null); return; }
      const range = sel.getRangeAt(0);
      const rect  = range.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 44 });
      setText(t);
    };
    document.addEventListener('mouseup', onSelect);
    document.addEventListener('touchend', onSelect);
    return () => {
      document.removeEventListener('mouseup', onSelect);
      document.removeEventListener('touchend', onSelect);
    };
  }, []);

  const read = () => {
    setActive(true);
    speak(text, null, () => setActive(false));
    setPos(null);
  };
  const stop = () => { window.speechSynthesis.cancel(); setActive(false); };

  return (
    <>
      <AnimatePresence>
        {pos && !active && (
          <motion.button
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
            style={{ position: 'absolute', top: pos.y, left: pos.x, transform: 'translateX(-50%)', zIndex: 9999 }}
            onClick={read}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />Read aloud
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && (
          <ReadingBar label={`"${text.slice(0, 30)}${text.length > 30 ? '…' : ''}"`}
            onStop={stop}
            rate={parseFloat(localStorage.getItem('readSpeed') || '1')}
            onRateChange={r => { localStorage.setItem('readSpeed', r); stop(); setTimeout(() => { setActive(true); speak(text, null, () => setActive(false)); }, 80); }} />
        )}
      </AnimatePresence>
    </>
  );
}

export default ReadAloudZone;
