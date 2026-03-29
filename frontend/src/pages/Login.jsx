import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Loader2,
  AlertCircle, Sparkles, CheckCircle, ArrowLeft, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { signIn, resetPassword, checkExists } from '@/lib/auth';
import { useI18n } from '@/context/I18nContext';
import { toast } from 'sonner';

// ── Cosmos helpers ──────────────────────────────────────────────────────────
function Starfield({ count = 80 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.8 + 0.4,
    op: Math.random() * 0.55 + 0.15,
    dur: Math.random() * 6 + 4,
    delay: Math.random() * -8,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.r, height:s.r, opacity:s.op }}
          animate={{ opacity:[s.op, s.op*2.2, s.op], scale:[1,1.4,1] }}
          transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_40%,rgba(59,130,246,0.18),transparent_55%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_70%,rgba(139,92,246,0.14),transparent_50%)]"/>
    </div>
  );
}

const inputCls = "w-full h-12 bg-white/[0.07] border border-white/15 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all px-4";

// ── Forgot Password modal ─────────────────────────────────────────────────────
function ForgotPassword({ onClose }) {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) { setError('Enter your email address'); return; }
    setLoading(true); setError('');
    try {
      const { error: resetErr } = await resetPassword(email);
      if (resetErr) { setError(resetErr); return; }
      setSent(true);
      toast.success('Password reset email sent!');
    } catch { setError('Failed to send reset email. Try again.'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{opacity:0,scale:0.93,y:16}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.93,y:16}} transition={{type:'spring',stiffness:360,damping:28}}
        className="w-full max-w-sm bg-[#0d1027] border border-white/15 rounded-2xl shadow-2xl p-7"
        onClick={e=>e.stopPropagation()}>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-400"/>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Check your inbox</h3>
            <p className="text-white/50 text-sm mb-1">We sent a reset link to</p>
            <p className="text-blue-400 font-semibold text-sm mb-6">{email}</p>
            <p className="text-white/30 text-xs mb-6">
              If you don't see it, check your spam folder. The link expires in 1 hour.
            </p>
            <Button onClick={onClose}
              className="w-full h-10 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/15">
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <button onClick={onClose} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-5 transition-colors">
              <ArrowLeft className="w-4 h-4"/>Back
            </button>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
              <Send className="w-5 h-5 text-blue-400"/>
            </div>
            <h3 className="text-xl font-black text-white mb-1">Reset your password</h3>
            <p className="text-white/40 text-sm mb-6">
              Enter your email and we'll send you a reset link instantly.
            </p>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                  <input type="email" placeholder="you@example.com"
                    value={email} onChange={e=>setEmail(e.target.value)}
                    className={`${inputCls} pl-11`} autoFocus/>
                </div>
              </div>
              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                    className="flex items-center gap-2 bg-red-500/15 text-red-300 rounded-xl px-4 py-3 text-sm border border-red-500/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
                  </motion.div>
                )}
              </AnimatePresence>
              <Button type="submit" disabled={loading}
                className="w-full h-11 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Sending…</> : <>Send reset link <Send className="w-4 h-4"/></>}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Login page ───────────────────────────────────────────────────────────
export default function Login() {
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [showForgot,   setShowForgot]   = useState(false);
  const [accountCheck, setAccountCheck] = useState(null); // null | 'checking' | true | false
  const { login } = useAppContext();
  const navigate  = useNavigate();

  // Check if account exists when user finishes typing email
  const handleEmailBlur = async () => {
    if (!email || !email.includes('@')) return;
    setAccountCheck('checking');
    try {
      const { exists } = await checkExists(email);
      setAccountCheck(exists);
    } catch { setAccountCheck(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const { user, error: authError } = await signIn(email, password);
      if (authError) { setError(authError); return; }
      login(user.email, user.name);
      navigate('/');
    } catch { setError('Sign in failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#05071a]">
      <AnimatePresence>
        {showForgot && <ForgotPassword onClose={() => setShowForgot(false)}/>}
      </AnimatePresence>

      {/* ── Left — Branding ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden border-r border-white/[0.06]">
        <Starfield count={80}/>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 gap-8 text-center">
          <motion.div initial={{opacity:0,scale:0.85,y:20}} animate={{opacity:1,scale:1,y:0}}
            transition={{duration:0.9,ease:'easeOut'}}>
            <motion.img src="/logo.png" alt="CAIE Scholar"
              className="w-52 h-52 object-contain drop-shadow-2xl mx-auto"
              style={{filter:'drop-shadow(0 0 60px rgba(59,130,246,0.6))'}}
              animate={{y:[0,-10,0]}}
              transition={{duration:5,repeat:Infinity,ease:'easeInOut'}}
            />
            <motion.h1 initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
              className="mt-8 text-4xl font-black tracking-tight">
              <span className="text-blue-400">CAIE</span>
              <span className="text-red-400 ml-2">Scholar</span>
            </motion.h1>
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}
              className="text-blue-200/70 text-base mt-2">
              Your Cambridge exam companion
            </motion.p>
          </motion.div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.9}}
            className="flex flex-wrap justify-center gap-2">
            {['📚 Past papers','🤖 AI notes','⏱ Study timer','🌍 7 languages'].map(f=>(
              <span key={f} className="text-xs text-blue-300/70 bg-white/[0.06] px-3 py-1.5 rounded-full border border-white/10">{f}</span>
            ))}
          </motion.div>
          {/* Orbit rings */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 opacity-20">
            {[1,2,3].map(i=>(
              <motion.div key={i} className="absolute inset-0 rounded-full border border-blue-400"
                style={{transform:`scale(${0.4+i*0.3})`}}
                animate={{rotate:360}} transition={{duration:8+i*4,repeat:Infinity,ease:'linear'}}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right — Form ── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center relative overflow-hidden px-6 py-14">
        <Starfield count={40}/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(99,102,241,0.07),transparent_60%)]"/>
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.5}}
          className="relative z-10 w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/logo.png" alt="" className="w-20 h-20 object-contain"
              style={{filter:'drop-shadow(0 0 20px rgba(59,130,246,0.5))'}}/>
          </div>

          <div className="bg-white/[0.05] border border-white/[0.10] rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-blue-400"/>
              <h1 className="text-3xl font-black text-white">Welcome back</h1>
            </div>
            <p className="text-white/40 text-sm mb-8">Sign in to your CAIE Scholar account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                  <input type="email" placeholder="you@example.com"
                    value={email} onChange={e=>{setEmail(e.target.value);setAccountCheck(null);}}
                    onBlur={handleEmailBlur}
                    className={`${inputCls} pl-11 pr-10`}/>
                  {/* Account existence indicator */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {accountCheck === 'checking' && <Loader2 className="w-4 h-4 text-white/30 animate-spin"/>}
                    {accountCheck === true  && <CheckCircle className="w-4 h-4 text-green-400"/>}
                    {accountCheck === false && (
                      <span title="No account found with this email" className="text-amber-400 text-xs font-bold">?</span>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {accountCheck === false && (
                    <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="text-xs text-amber-400/80 mt-1.5 pl-1">
                      No account found —{' '}
                      <Link to="/signup" className="underline font-semibold hover:text-amber-300">create one free</Link>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">Password</Label>
                  <button type="button" onClick={()=>setShowForgot(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                  <input type={showPwd?'text':'password'} placeholder="••••••••"
                    value={password} onChange={e=>setPassword(e.target.value)}
                    className={`${inputCls} pl-11 pr-11`}/>
                  <button type="button" onClick={()=>setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                    className="flex items-center gap-2 bg-red-500/15 text-red-300 rounded-xl px-4 py-3 text-sm border border-red-500/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={loading}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-900/40 gap-2 transition-all">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Signing in…</> : <>Sign in<ArrowRight className="w-4 h-4"/></>}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-white/40 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">Create one free</Link>
              </p>
            </div>
          </div>

          <p className="text-center text-white/25 text-xs mt-6">No credit card · No ads · Data stays in your browser</p>
        </motion.div>
      </div>
    </div>
  );
}
