import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { useI18n } from '@/context/I18nContext';

// Stable starfield — memoised so particles don't regenerate on re-render
function Starfield({ count = 90, right = false }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.8 + 0.4,
    opacity: Math.random() * 0.55 + 0.15,
    dur: Math.random() * 6 + 4,
    delay: Math.random() * -8,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.opacity }}
          animate={{ opacity: [s.opacity, s.opacity * 2, s.opacity], scale: [1, 1.4, 1] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Nebula blobs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_40%,rgba(59,130,246,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_70%,rgba(139,92,246,0.14),transparent_50%)]" />
      {right && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(220,38,38,0.10),transparent_45%)]" />}
    </div>
  );
}

// Floating orbs behind the form
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { cx: '15%', cy: '20%', r: 180, color: 'rgba(59,130,246,0.06)', dur: 14 },
        { cx: '85%', cy: '60%', r: 240, color: 'rgba(139,92,246,0.05)', dur: 18 },
        { cx: '50%', cy: '85%', r: 160, color: 'rgba(16,185,129,0.04)', dur: 12 },
      ].map((o, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{
            left: o.cx, top: o.cy, width: o.r, height: o.r,
            background: `radial-gradient(circle, ${o.color}, transparent 70%)`,
            transform: 'translate(-50%,-50%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 3 }}
        />
      ))}
    </div>
  );
}

export default function Login() {
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const { login }  = useAppContext();
  const { t }      = useI18n();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 600));
      login(email);
      navigate('/');
    } catch { setError('Invalid email or password.'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full h-12 bg-white/[0.07] border border-white/15 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all px-4";

  return (
    <div className="min-h-screen flex bg-[#05071a]">
      {/* ── Left — Branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden border-r border-white/[0.06]">
        <Starfield count={80} />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="text-center"
          >
            <motion.img
              src="/logo.png" alt="CAIE Scholar"
              className="w-52 h-52 object-contain drop-shadow-2xl mx-auto"
              style={{ filter: 'drop-shadow(0 0 60px rgba(59,130,246,0.6))' }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-4xl font-black tracking-tight"
            >
              <span className="text-blue-400">CAIE</span>
              <span className="text-red-400 ml-2">Scholar</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-blue-200/70 text-base mt-2"
            >
              Your Cambridge exam companion
            </motion.p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {['📚 Past papers', '🤖 AI notes', '⏱ Study timer', '🌍 7 languages'].map(f => (
              <span key={f} className="text-xs text-blue-300/70 bg-white/[0.06] px-3 py-1.5 rounded-full border border-white/10">
                {f}
              </span>
            ))}
          </motion.div>

          {/* Orbiting planet rings */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 opacity-20">
            {[1,2,3].map(i => (
              <motion.div key={i}
                className="absolute inset-0 rounded-full border border-blue-400"
                style={{ transform: `scale(${0.4 + i*0.3})` }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8 + i * 4, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — Form panel ── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center relative overflow-hidden px-6 py-14">
        <Starfield count={50} right />
        <FloatingOrbs />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/logo.png" alt="CAIE Scholar" className="w-20 h-20 object-contain"
              style={{ filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.5))' }} />
          </div>

          {/* Glass card */}
          <div className="bg-white/[0.05] border border-white/[0.10] rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h1 className="text-3xl font-black text-white">Welcome back</h1>
            </div>
            <p className="text-white/40 text-sm mb-8">Sign in to your CAIE Scholar account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className={`${inputCls} pl-11`}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className={`${inputCls} pl-11 pr-11`}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 bg-red-500/15 text-red-300 rounded-xl px-4 py-3 text-sm border border-red-500/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={loading}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-900/40 gap-2 transition-all">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
                  : <>Sign in <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-white/40 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  Create one free
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom trust text */}
          <p className="text-center text-white/25 text-xs mt-6">
            No credit card · No ads · Data stays in your browser
          </p>
        </motion.div>
      </div>
    </div>
  );
}
