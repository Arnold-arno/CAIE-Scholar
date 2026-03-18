/**
 * AvatarPicker.jsx
 *
 * Full-featured avatar selection modal with four tabs:
 *   1. Upload  — from PC (file picker, drag-and-drop)
 *   2. URL     — paste any image URL or Google Photos shared link
 *   3. Built-in — 24 study-themed SVG avatars to choose from
 *   4. Remove  — clear avatar and return to initials
 *
 * Usage:
 *   <AvatarPicker
 *     currentAvatar={user.avatar}
 *     userName={user.name}
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onSave={(dataUrl) => updateProfile({ avatar: dataUrl })}
 *   />
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Link2, Palette, Trash2, X, Check, Loader2,
  AlertCircle, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarCircle from '@/components/ui/avatar';

// ── Canvas resize helper ──────────────────────────────────────────────────────
export async function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Not an image file')); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const SIZE = 256;
      const cv   = document.createElement('canvas');
      cv.width = SIZE; cv.height = SIZE;
      const ctx = cv.getContext('2d');
      const min = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      resolve(cv.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')); };
    img.src = url;
  });
}

async function resizeImageUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const SIZE = 256;
      const cv   = document.createElement('canvas');
      cv.width = SIZE; cv.height = SIZE;
      const ctx = cv.getContext('2d');
      const min = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, SIZE, SIZE);
      try {
        resolve(cv.toDataURL('image/jpeg', 0.88));
      } catch {
        // CORS block on canvas — fall back to using the URL directly
        resolve(src);
      }
    };
    img.onerror = () => reject(new Error('Could not load image from URL. Check the link is a direct image URL.'));
    img.src = src;
  });
}

// ── 24 built-in SVG avatar designs ───────────────────────────────────────────
// Each is a self-contained SVG data-URL — study / academic themed

const BG_PAIRS = [
  ['#dbeafe','#1d4ed8'], ['#dcfce7','#15803d'], ['#fef3c7','#b45309'],
  ['#ede9fe','#6d28d9'], ['#fee2e2','#b91c1c'], ['#cffafe','#0e7490'],
  ['#fce7f3','#9d174d'], ['#d1fae5','#065f46'], ['#fef9c3','#a16207'],
  ['#e0f2fe','#0369a1'], ['#f3e8ff','#7e22ce'], ['#ecfdf5','#047857'],
];

// SVG paths for 6 icon shapes used across avatars
const ICONS = {
  book:     'M6 3h13v18H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm0 0v18m4-11h6m-6 4h6',
  cap:      'M22 10L12 5 2 10l10 5 10-5zm-10 5v6M6.5 12.5v4a7 7 0 0 0 11 0v-4',
  pencil:   'M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  star:     'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  atom:     'M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20zM2 12h20M12 2c2.76 4.5 2.76 15.5 0 20M12 2c-2.76 4.5-2.76 15.5 0 20',
  bulb:     'M9 21h6m-3-18a7 7 0 0 1 4 12.9V16H8v-2.1A7 7 0 0 1 12 3z',
  flask:    'M9 3h6m-3 0v5L5.5 15a5 5 0 0 0 13 0L14 8V3',
  globe:    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c2.76 4.5 2.76 15.5 0 20M12 2c-2.76 4.5-2.76 15.5 0 20',
};

const ICON_KEYS = Object.keys(ICONS);

function makeSvgAvatar(bg, fg, iconKey) {
  const path = ICONS[iconKey];
  const svg  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
    <rect width="40" height="40" fill="${bg}" rx="20"/>
    <g transform="translate(8,8)" fill="none" stroke="${fg}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="${path}"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Generate 24 built-in avatars
const BUILTIN_AVATARS = BG_PAIRS.flatMap(([bg, fg], i) =>
  [ICON_KEYS[i % ICON_KEYS.length], ICON_KEYS[(i + 3) % ICON_KEYS.length]].map(icon => ({
    id:  `builtin-${i}-${icon}`,
    src: makeSvgAvatar(bg, fg, icon),
    bg, fg, icon,
  }))
);

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'upload',  label: 'Upload',    icon: Upload  },
  { id: 'url',     label: 'From URL',  icon: Link2   },
  { id: 'builtin', label: 'Avatars',   icon: Palette },
  { id: 'remove',  label: 'Remove',    icon: Trash2  },
];

// ── Main modal ────────────────────────────────────────────────────────────────
export default function AvatarPicker({ currentAvatar, userName, userEmail, open, onClose, onSave }) {
  const [tab,      setTab]      = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const [preview,  setPreview]  = useState(currentAvatar || null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPreview(currentAvatar || null);
      setUrlInput('');
      setError('');
      setTab('upload');
    }
  }, [open, currentAvatar]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const data = await resizeImageFile(file);
      setPreview(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileInput = (e) => { handleFile(e.target.files?.[0]); e.target.value = ''; };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlLoad = async () => {
    if (!urlInput.trim()) { setError('Please enter a URL'); return; }
    setLoading(true); setError('');
    try {
      // Handle Google Photos share URLs — they end in ?... not in an image extension.
      // We can't proxy them, so we use them as-is as an img src (browser fetches).
      // For direct image URLs (jpg/png/etc) we try canvas resize.
      const isGooglePhotos = urlInput.includes('photos.google.com') || urlInput.includes('lh3.googleusercontent.com');
      if (isGooglePhotos) {
        // Google Photos: use URL directly as src — we can't canvas-resize cross-origin
        setPreview(urlInput.trim());
      } else {
        const data = await resizeImageUrl(urlInput.trim());
        setPreview(data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (tab === 'remove') { onSave(null); onClose(); return; }
    if (!preview) { setError('Please select or upload an image first'); return; }
    onSave(preview);
    onClose();
  };

  const dummyUser = { name: userName, email: userEmail, avatar: preview };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <AvatarCircle user={dummyUser} size={44} className="ring-2 ring-white shadow-sm" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{userName || userEmail || 'Your avatar'}</p>
                  <p className="text-xs text-gray-500">Choose how you'd like to set your profile photo</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50">
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all ${
                    tab === t.id
                      ? 'text-blue-700 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}>
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5" style={{ minHeight: 280 }}>
              <AnimatePresence mode="wait">

                {/* ── Upload tab ── */}
                {tab === 'upload' && (
                  <motion.div key="upload" initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}>
                    <div
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                    >
                      {loading
                        ? <Loader2 className="w-10 h-10 mx-auto text-blue-400 animate-spin mb-3" />
                        : <Upload className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                      }
                      <p className="font-semibold text-gray-700 mb-1">
                        {loading ? 'Processing…' : 'Click to browse or drag & drop'}
                      </p>
                      <p className="text-xs text-gray-400">JPG, PNG, GIF, WebP — auto-cropped to square</p>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                    </div>

                    {/* Preview */}
                    {preview && !loading && (
                      <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <AvatarCircle user={dummyUser} size={40} />
                        <div>
                          <p className="text-sm font-semibold text-green-800">Photo ready</p>
                          <p className="text-xs text-green-600">Looks good! Click Save to apply.</p>
                        </div>
                        <button onClick={() => setPreview(null)} className="ml-auto text-gray-400 hover:text-red-500 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── URL tab ── */}
                {tab === 'url' && (
                  <motion.div key="url" initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}
                    className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Image URL</label>
                      <div className="flex gap-2">
                        <input
                          value={urlInput}
                          onChange={e => { setUrlInput(e.target.value); setError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleUrlLoad()}
                          placeholder="https://…  or paste a Google Photos link"
                          className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button onClick={handleUrlLoad} disabled={loading || !urlInput.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 flex-shrink-0">
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Preview */}
                    {preview && !loading && tab === 'url' && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <AvatarCircle user={dummyUser} size={40} />
                        <div>
                          <p className="text-sm font-semibold text-green-800">Photo loaded</p>
                          <p className="text-xs text-green-600 truncate max-w-[220px]">{urlInput}</p>
                        </div>
                        <button onClick={() => { setPreview(null); setUrlInput(''); }} className="ml-auto text-gray-400 hover:text-red-500 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-blue-800">How to use Google Photos:</p>
                      <ol className="text-xs text-blue-700 space-y-1 list-decimal ml-4">
                        <li>Open Google Photos and find your photo</li>
                        <li>Click <strong>Share → Create link</strong></li>
                        <li>Paste the link above and click ✓</li>
                      </ol>
                      <p className="text-xs text-blue-600 mt-2">
                        <strong>Direct image URLs</strong> (ending in .jpg, .png, etc.) also work — right-click any image on the web and choose "Copy image address".
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── Built-in avatars tab ── */}
                {tab === 'builtin' && (
                  <motion.div key="builtin" initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}>
                    <p className="text-xs font-semibold text-gray-500 mb-3">Choose one of these study-themed avatars:</p>
                    <div className="grid grid-cols-6 gap-2 max-h-52 overflow-y-auto pr-1">
                      {BUILTIN_AVATARS.map(av => {
                        const isSelected = preview === av.src;
                        return (
                          <button key={av.id} onClick={() => setPreview(av.src)}
                            className={`relative rounded-xl overflow-hidden transition-all hover:scale-110 ${
                              isSelected ? 'ring-3 ring-blue-500 ring-offset-2 scale-110' : 'hover:ring-2 hover:ring-blue-300'
                            }`}>
                            <img src={av.src} alt={av.icon} className="w-full aspect-square" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-blue-700" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {preview && BUILTIN_AVATARS.find(a => a.src === preview) && (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <AvatarCircle user={dummyUser} size={36} />
                        <p className="text-xs font-semibold text-blue-800">Avatar selected — click Save to apply</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Remove tab ── */}
                {tab === 'remove' && (
                  <motion.div key="remove" initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}}
                    className="flex flex-col items-center justify-center py-8 gap-5">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-200">
                      <Trash2 className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800 mb-1">Remove profile photo?</p>
                      <p className="text-sm text-gray-500">Your initials will be shown instead.</p>
                    </div>
                    <AvatarCircle user={{ ...dummyUser, avatar: null }} size={64} className="ring-4 ring-gray-100" />
                    <p className="text-xs text-gray-400">This is what your profile will look like</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  className="mx-5 mb-3">
                  <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex gap-3 p-5 pt-3 border-t border-gray-100">
              <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl border-2">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={tab !== 'remove' && !preview}
                className={`flex-1 h-11 rounded-xl font-semibold ${
                  tab === 'remove'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}>
                {tab === 'remove' ? 'Remove photo' : 'Save photo'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
