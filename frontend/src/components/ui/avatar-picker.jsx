/**
 * avatar-picker.jsx
 *
 * Full-featured avatar selection modal with:
 *   1. Upload  — drag-and-drop or file browse
 *   2. URL     — paste any direct image URL
 *   3. Built-in — 24 study-themed SVG avatars
 *   4. Remove  — clear and use initials
 *
 * NEW: Interactive crop editor on the Upload tab
 *   - Zoom slider (0.5× – 3×)
 *   - Drag to reposition the crop window
 *   - Live 128px preview circle
 *   - Saves the cropped region to a 256×256 JPEG
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Link2, Palette, Trash2, X, Check, Loader2,
  AlertCircle, ZoomIn, ZoomOut, Move, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarCircle from '@/components/ui/avatar';

// ── Crop canvas helper ────────────────────────────────────────────────────────
function cropToDataUrl(img, offsetX, offsetY, zoom, outputSize = 256) {
  const cv  = document.createElement('canvas');
  cv.width  = outputSize;
  cv.height = outputSize;
  const ctx = cv.getContext('2d');

  // The crop window in image-pixel space
  const cropSize = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
  const cx = Math.max(0, Math.min(img.naturalWidth  - cropSize, offsetX));
  const cy = Math.max(0, Math.min(img.naturalHeight - cropSize, offsetY));

  ctx.drawImage(img, cx, cy, cropSize, cropSize, 0, 0, outputSize, outputSize);
  return cv.toDataURL('image/jpeg', 0.88);
}

// ── Interactive crop editor ───────────────────────────────────────────────────
function CropEditor({ src, onConfirm, onCancel }) {
  const [zoom,    setZoom]    = useState(1);
  const [offset,  setOffset]  = useState({ x: 0, y: 0 });   // in image pixels
  const [dragging,setDragging]= useState(false);
  const [preview, setPreview] = useState(src);
  const dragStart = useRef(null);
  const imgRef    = useRef(null);
  const DISPLAY   = 280; // px — the square crop preview container

  // Update preview whenever zoom/offset changes
  useEffect(() => {
    if (!imgRef.current || !imgRef.current.complete) return;
    try {
      const url = cropToDataUrl(imgRef.current, offset.x, offset.y, zoom);
      setPreview(url);
    } catch {}
  }, [zoom, offset]);

  const handleImgLoad = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    // Centre the crop
    const cropSize = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    setOffset({
      x: (img.naturalWidth  - cropSize) / 2,
      y: (img.naturalHeight - cropSize) / 2,
    });
    try { setPreview(cropToDataUrl(img, (img.naturalWidth-cropSize)/2, (img.naturalHeight-cropSize)/2, zoom)); } catch {}
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current || !imgRef.current) return;
    const img = imgRef.current;
    const cropSize = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    // Scale: DISPLAY px maps to cropSize image px
    const scale = cropSize / DISPLAY;
    const dx = (e.clientX - dragStart.current.mouseX) * scale;
    const dy = (e.clientY - dragStart.current.mouseY) * scale;
    const nx = Math.max(0, Math.min(img.naturalWidth  - cropSize, dragStart.current.ox - dx));
    const ny = Math.max(0, Math.min(img.naturalHeight - cropSize, dragStart.current.oy - dy));
    setOffset({ x: nx, y: ny });
  }, [dragging, zoom]);
  const onMouseUp = useCallback(() => { setDragging(false); }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup',   onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  // Touch support
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { mouseX: t.clientX, mouseY: t.clientY, ox: offset.x, oy: offset.y };
  };
  const onTouchMove = (e) => {
    if (!dragging || !dragStart.current || !imgRef.current) return;
    const t  = e.touches[0];
    const img = imgRef.current;
    const cropSize = Math.min(img.naturalWidth, img.naturalHeight) / zoom;
    const scale = cropSize / DISPLAY;
    const dx = (t.clientX - dragStart.current.mouseX) * scale;
    const dy = (t.clientY - dragStart.current.mouseY) * scale;
    const nx = Math.max(0, Math.min(img.naturalWidth  - cropSize, dragStart.current.ox - dx));
    const ny = Math.max(0, Math.min(img.naturalHeight - cropSize, dragStart.current.oy - dy));
    setOffset({ x: nx, y: ny });
  };

  const handleConfirm = () => {
    if (!imgRef.current) return;
    const url = cropToDataUrl(imgRef.current, offset.x, offset.y, zoom);
    onConfirm(url);
  };

  const reset = () => {
    setZoom(1);
    if (imgRef.current) {
      const img = imgRef.current;
      const cropSize = Math.min(img.naturalWidth, img.naturalHeight);
      setOffset({ x:(img.naturalWidth-cropSize)/2, y:(img.naturalHeight-cropSize)/2 });
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Move className="w-4 h-4 text-blue-500"/>
        Drag to reposition · Use slider to zoom
      </p>

      {/* Crop viewport */}
      <div className="flex gap-5 items-start flex-wrap">
        <div
          className="relative rounded-2xl overflow-hidden border-2 border-blue-400/50 cursor-move select-none flex-shrink-0"
          style={{ width: DISPLAY, height: DISPLAY }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => setDragging(false)}
        >
          {/* Actual image — we translate it so the crop area stays centred */}
          <img
            ref={imgRef}
            src={src}
            alt="Crop source"
            crossOrigin="anonymous"
            draggable={false}
            onLoad={handleImgLoad}
            className="absolute top-0 left-0 pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: imgRef.current
                ? `${-offset.x / (imgRef.current.naturalWidth  - Math.min(imgRef.current.naturalWidth,imgRef.current.naturalHeight)/zoom) * 100}% ${-offset.y / (imgRef.current.naturalHeight - Math.min(imgRef.current.naturalWidth,imgRef.current.naturalHeight)/zoom) * 100}%`
                : 'center',
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
            }}
          />
          {/* Circular mask overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(circle at center, transparent 46%, rgba(0,0,0,0.55) 47%)'
          }}/>
          {/* Corner guides */}
          {[['top-2 left-2','border-t-2 border-l-2'],['top-2 right-2','border-t-2 border-r-2'],
            ['bottom-2 left-2','border-b-2 border-l-2'],['bottom-2 right-2','border-b-2 border-r-2']
          ].map(([pos,border],i)=>(
            <div key={i} className={`absolute ${pos} w-5 h-5 ${border} border-white/80`}/>
          ))}
          {/* Drag hint */}
          {!dragging && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
              <span className="text-[10px] bg-black/50 text-white/70 px-2 py-0.5 rounded-full">Drag to reposition</span>
            </div>
          )}
        </div>

        {/* Right panel — preview + controls */}
        <div className="flex flex-col gap-3 flex-1 min-w-[140px]">
          {/* Live preview */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</p>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-400/40 mx-auto shadow-lg">
              <img src={preview} alt="Preview" className="w-full h-full object-cover"/>
            </div>
          </div>

          {/* Zoom */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Zoom</p>
              <span className="text-xs text-gray-400">{zoom.toFixed(1)}×</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setZoom(z=>Math.max(0.5,z-0.1))}
                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[hsl(222,22%,18%)] flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ZoomOut className="w-3.5 h-3.5 text-gray-500"/>
              </button>
              <input type="range" min="0.5" max="3" step="0.05" value={zoom}
                onChange={e=>setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500"/>
              <button onClick={()=>setZoom(z=>Math.min(3,z+0.1))}
                className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[hsl(222,22%,18%)] flex items-center justify-center hover:bg-gray-200 transition-colors">
                <ZoomIn className="w-3.5 h-3.5 text-gray-500"/>
              </button>
            </div>
          </div>

          {/* Reset */}
          <button onClick={reset}
            className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 border border-dashed border-gray-300 dark:border-[hsl(222,18%,24%)] rounded-xl">
            <RotateCcw className="w-3.5 h-3.5"/>Reset crop
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl border-2 text-sm h-10">
          Back
        </Button>
        <Button onClick={handleConfirm}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-2 text-sm h-10">
          <Check className="w-4 h-4"/>Use this photo
        </Button>
      </div>
    </div>
  );
}

// ── Built-in avatar data ──────────────────────────────────────────────────────
const BUILT_INS = [
  {id:'owl',   emoji:'🦉', bg:'from-indigo-500 to-purple-600'},
  {id:'rocket',emoji:'🚀', bg:'from-blue-500 to-cyan-500'},
  {id:'star',  emoji:'⭐', bg:'from-yellow-400 to-orange-500'},
  {id:'book',  emoji:'📚', bg:'from-green-500 to-teal-600'},
  {id:'atom',  emoji:'⚛️', bg:'from-purple-500 to-pink-500'},
  {id:'brain', emoji:'🧠', bg:'from-red-500 to-rose-600'},
  {id:'grad',  emoji:'🎓', bg:'from-blue-600 to-indigo-700'},
  {id:'calc',  emoji:'🔢', bg:'from-gray-600 to-slate-700'},
  {id:'dna',   emoji:'🧬', bg:'from-teal-500 to-cyan-600'},
  {id:'globe', emoji:'🌍', bg:'from-blue-400 to-green-500'},
  {id:'fire',  emoji:'🔥', bg:'from-orange-500 to-red-600'},
  {id:'moon',  emoji:'🌙', bg:'from-indigo-700 to-slate-800'},
  {id:'bolt',  emoji:'⚡', bg:'from-yellow-400 to-amber-500'},
  {id:'flask', emoji:'⚗️', bg:'from-emerald-500 to-teal-700'},
  {id:'micro', emoji:'🔬', bg:'from-violet-500 to-fuchsia-600'},
  {id:'comp',  emoji:'💻', bg:'from-slate-600 to-blue-700'},
];

function builtInToDataUrl(avatar) {
  const cv  = document.createElement('canvas');
  cv.width  = 256; cv.height = 256;
  const ctx = cv.getContext('2d');
  const grad = ctx.createLinearGradient(0,0,256,256);
  grad.addColorStop(0, '#6366f1'); grad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = grad; ctx.fillRect(0,0,256,256);
  ctx.font = '120px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(avatar.emoji, 128, 140);
  try { return cv.toDataURL('image/png'); } catch { return null; }
}

// ── Export resize helper (used by Signup) ─────────────────────────────────────
export async function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Not an image file')); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const SIZE = 256;
      const cv   = document.createElement('canvas');
      cv.width = SIZE; cv.height = SIZE;
      const ctx  = cv.getContext('2d');
      const min  = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width-min)/2, (img.height-min)/2, min, min, 0, 0, SIZE, SIZE);
      URL.revokeObjectURL(url);
      resolve(cv.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')); };
    img.src = url;
  });
}

// ── Main AvatarPicker component ───────────────────────────────────────────────
export default function AvatarPicker({ currentAvatar, userName, userEmail, open, onClose, onSave }) {
  const [tab,        setTab]        = useState('upload');
  const [urlInput,   setUrlInput]   = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError,   setUrlError]   = useState('');
  const [selected,   setSelected]   = useState(null);   // built-in selection
  const [dragging,   setDragging]   = useState(false);
  const [cropSrc,    setCropSrc]    = useState(null);   // raw image src for crop editor
  const [fileLoading,setFileLoading]= useState(false);
  const fileRef = useRef(null);

  const previewUser = useMemo(() => ({ name: userName, email: userEmail, avatar: currentAvatar }), [userName, userEmail, currentAvatar]);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { return; }
    if (file.size > 8 * 1024 * 1024) { return; }
    setFileLoading(true);
    try {
      const url = URL.createObjectURL(file);
      setCropSrc(url);  // Open crop editor instead of saving directly
    } catch {}
    finally { setFileLoading(false); }
  }, []);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleUrlLoad = async () => {
    const u = urlInput.trim();
    if (!u) return;
    setUrlLoading(true); setUrlError('');
    try {
      // Try direct load first
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = u;
        setTimeout(rej, 8000);
      });
      setCropSrc(u);
      setTab('upload'); // Show crop editor
    } catch {
      // Fallback: use as-is (may be cross-origin)
      onSave(u); onClose();
    } finally { setUrlLoading(false); }
  };

  const handleCropConfirm = (dataUrl) => {
    setCropSrc(null);
    onSave(dataUrl);
    onClose();
  };

  const handleBuiltIn = (av) => {
    const url = builtInToDataUrl(av);
    if (url) { onSave(url); onClose(); }
    else { onSave(av.emoji); onClose(); }
  };

  const TABS = [
    { id: 'upload',   label: 'Upload',    icon: Upload },
    { id: 'url',      label: 'From URL',  icon: Link2 },
    { id: 'builtin',  label: 'Built-in',  icon: Palette },
    { id: 'remove',   label: 'Remove',    icon: Trash2 },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ opacity:0, scale:0.94, y:16 }} animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.94, y:16 }} transition={{ type:'spring', stiffness:360, damping:28 }}
            className="w-full max-w-lg bg-white dark:bg-[hsl(222,24%,11%)] rounded-2xl shadow-2xl border border-gray-200 dark:border-[hsl(222,18%,22%)] overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[hsl(222,18%,18%)] bg-gradient-to-r from-gray-50 to-blue-50 dark:from-[hsl(222,26%,13%)] dark:to-[hsl(235,22%,14%)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-200 dark:ring-blue-800">
                  <AvatarCircle user={previewUser} size={40}/>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">Profile photo</p>
                  <p className="text-xs text-gray-400">{userName || 'Change your photo'}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[hsl(222,22%,18%)] text-gray-400 transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-gray-100 dark:border-[hsl(222,18%,18%)]">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setTab(id); setCropSrc(null); }}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
                    tab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}>
                  <Icon className="w-4 h-4"/>
                  <span className="hidden sm:block">{label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-5 min-h-[280px]">

              {/* Upload tab — shows crop editor when image selected */}
              {tab === 'upload' && (
                cropSrc ? (
                  <CropEditor src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)}/>
                ) : (
                  <div
                    onDragOver={e=>{e.preventDefault();setDragging(true)}}
                    onDragLeave={()=>setDragging(false)}
                    onDrop={handleDrop}
                    onClick={()=>fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center ${
                      dragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-[hsl(222,18%,24%)] hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                    }`}>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e=>handleFile(e.target.files?.[0])}/>
                    {fileLoading ? (
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2"/>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3"/>
                        <p className="font-semibold text-gray-600 dark:text-gray-400">Drop an image here</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or click to browse</p>
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-3 font-medium">
                          ✨ You can zoom & reposition after selecting
                        </p>
                      </>
                    )}
                  </div>
                )
              )}

              {/* URL tab */}
              {tab === 'url' && (
                cropSrc ? (
                  <CropEditor src={cropSrc} onConfirm={handleCropConfirm} onCancel={()=>setCropSrc(null)}/>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Direct image URL</label>
                      <div className="flex gap-2">
                        <input value={urlInput} onChange={e=>setUrlInput(e.target.value)}
                          onKeyDown={e=>e.key==='Enter'&&handleUrlLoad()}
                          placeholder="https://example.com/photo.jpg"
                          className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl bg-white dark:bg-[hsl(222,22%,13%)] text-gray-900 dark:text-gray-100 text-sm focus:border-blue-500 focus:outline-none"/>
                        <Button onClick={handleUrlLoad} disabled={!urlInput||urlLoading}
                          className="bg-blue-600 text-white rounded-xl px-4 shrink-0 gap-1.5">
                          {urlLoading?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>}
                          Load
                        </Button>
                      </div>
                    </div>
                    {urlError && (
                      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-3 py-2 text-sm border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-4 h-4 flex-shrink-0"/>{urlError}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Paste a direct link to a JPG, PNG, or WebP image. You can crop it after loading.
                    </p>
                  </div>
                )
              )}

              {/* Built-in avatars */}
              {tab === 'builtin' && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Choose a built-in avatar:</p>
                  <div className="grid grid-cols-8 gap-2">
                    {BUILT_INS.map(av => (
                      <button key={av.id}
                        onClick={() => handleBuiltIn(av)}
                        title={av.id}
                        className={`w-full aspect-square rounded-xl bg-gradient-to-br ${av.bg} flex items-center justify-center text-2xl hover:scale-110 transition-transform shadow-md`}>
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
                    Click any avatar to use it immediately
                  </p>
                </div>
              )}

              {/* Remove */}
              {tab === 'remove' && (
                <div className="flex flex-col items-center justify-center min-h-[200px] gap-5">
                  <div className="w-20 h-20 rounded-full overflow-hidden opacity-40 ring-2 ring-gray-300">
                    <AvatarCircle user={previewUser} size={80}/>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Remove profile photo?</p>
                    <p className="text-sm text-gray-400">Your initials will be shown instead</p>
                  </div>
                  <Button onClick={()=>{onSave(null);onClose();}}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-xl gap-2 px-6">
                    <Trash2 className="w-4 h-4"/>Remove photo
                  </Button>
                </div>
              )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
