import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Loader2,
  AlertCircle, Sparkles, CheckCircle, ArrowLeft, Send, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { signIn, resetPassword, checkExists } from '@/lib/auth';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

const inputCls = 'w-full h-12 bg-white/[0.07] border border-white/15 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all px-4';

function Starfield({ count = 70 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.8 + 0.4, op: Math.random() * 0.5 + 0.15,
    dur: Math.random() * 6 + 4, delay: Math.random() * -8,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.r, height:s.r, opacity:s.op }}
          animate={{ opacity:[s.op, s.op*2.2, s.op] }}
          transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(59,130,246,0.18),transparent_55%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(139,92,246,0.13),transparent_50%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_20%,rgba(16,185,129,0.07),transparent_45%)]"/>
    </div>
  );
}

function ForgotModal({ onClose }) {
  const [email, setEmail]   = useState('');
  const [state, setState]   = useState('idle'); // idle | loading | sent | error
  const [errMsg, setErrMsg] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!email) { setErrMsg('Enter your email address'); return; }
    setState('loading');
    try {
      const { error } = await resetPassword(email);
      if (error) { setErrMsg(error); setState('error'); return; }
      setState('sent');
      toast.success('Password reset email sent!');
    } catch { setErrMsg('Failed. Try again.'); setState('error'); }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div
        initial={{opacity:0, y:40}} animate={{opacity:1, y:0}}
        exit={{opacity:0, y:40}} transition={{type:'spring',stiffness:340,damping:28}}
        className="w-full sm:max-w-sm bg-[#0e1228] border border-white/15 rounded-t-3xl sm:rounded-2xl shadow-2xl p-7"
        onClick={e=>e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 transition-colors">
          <X className="w-4 h-4"/>
        </button>
        {state === 'sent' ? (
          <div className="text-center pt-2">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-400"/>
            </div>
            <h3 className="text-xl font-black text-white mb-2">Check your inbox</h3>
            <p className="text-white/50 text-sm mb-1">Reset link sent to</p>
            <p className="text-blue-400 font-semibold text-sm mb-5">{email}</p>
            <p className="text-white/25 text-xs mb-6">Didn't receive it? Check spam. Link expires in 1 hour.</p>
            <Button onClick={onClose} className="w-full h-11 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/15">
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4">
              <Send className="w-5 h-5 text-blue-400"/>
            </div>
            <h3 className="text-xl font-black text-white mb-1">Forgot password?</h3>
            <p className="text-white/40 text-sm mb-6">Enter your email and we'll send a reset link right away.</p>
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"/>
                <input type="email" placeholder="you@example.com"
                  value={email} onChange={e=>{setEmail(e.target.value); if(state==='error') setState('idle');}}
                  className={`${inputCls} pl-11`} autoFocus/>
              </div>
              {(state === 'error') && (
                <div className="flex items-center gap-2 bg-red-500/15 text-red-300 rounded-xl px-3 py-2.5 text-sm border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0"/>{errMsg}
                </div>
              )}
              <Button type="submit" disabled={state==='loading'}
                className="w-full h-11 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-2">
                {state==='loading' ? <><Loader2 className="w-4 h-4 animate-spin"/>Sending…</> : <>Send reset link<ArrowRight className="w-4 h-4"/></>}
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Login() {
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [showForgot,setShowForgot]= useState(false);
  const [emailState,setEmailState]= useState('idle'); // idle | checking | found | notfound
  const { login } = useAppContext();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { confirm, ConfirmUI } = useConfirm();
  const hasData   = email.trim().length > 0 || password.length > 0;

  const handleBack = async () => {
    if (hasData) {
      const yes = await confirm({
        title: 'Leave sign in?',
        message: 'The email and password you entered will be cleared.',
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        danger: false,
        icon: 'warn',
      });
      if (!yes) return;
    }
    // Go back to where the user came from, or home
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  };

  const handleEmailBlur = async () => {
    if (!email || !email.includes('@') || !email.includes('.')) return;
    setEmailState('checking');
    try {
      const { exists } = await checkExists(email);
      setEmailState(exists ? 'found' : 'notfound');
    } catch { setEmailState('idle'); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email address'); return; }
    if (!password)     { setError('Enter your password'); return; }
    setLoading(true); setError('');
    try {
      const { user, error: authErr } = await signIn(email.trim(), password);
      if (authErr) { setError(authErr); return; }
      login(user.email, user.name || user.email.split('@')[0]);
      toast.success(`Welcome back, ${user.name || user.email.split('@')[0]}!`);
      navigate('/');
    } catch { setError('Sign in failed — please check your details and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#05071a] relative">
      <ConfirmUI/>
      <AnimatePresence>{showForgot && <ForgotModal onClose={()=>setShowForgot(false)}/>}</AnimatePresence>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden border-r border-white/[0.06] flex-col">
        <Starfield count={90}/>
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-10 gap-8 text-center">
          <motion.div initial={{opacity:0,scale:0.85,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{duration:0.9}}>
            <motion.img src="/logo.png" alt="CAIE Scholar"
              className="w-52 h-52 object-contain mx-auto drop-shadow-2xl"
              style={{filter:'drop-shadow(0 0 60px rgba(59,130,246,0.55))'}}
              animate={{y:[0,-12,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut'}}/>
            <motion.h1 initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
              className="mt-7 text-4xl font-black tracking-tight">
              <span className="text-blue-400">CAIE</span><span className="text-red-400 ml-2">Scholar</span>
            </motion.h1>
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}
              className="text-blue-200/60 text-base mt-2">Your Cambridge exam companion</motion.p>
          </motion.div>
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.9}}
            className="grid grid-cols-2 gap-2.5 w-full max-w-[260px]">
            {[['📚','Past papers'],['🤖','AI notes'],['⏱','Study timer'],['🌍','7 languages']].map(([e,l])=>(
              <div key={l} className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5">
                <span className="text-lg">{e}</span>
                <span className="text-xs text-white/55 font-medium">{l}</span>
              </div>
            ))}
          </motion.div>
          <p className="text-white/20 text-xs">Free · No ads · Private</p>
        </div>
        {/* Orbit rings */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-52 h-52 opacity-15 pointer-events-none">
          {[0.42,0.65,0.9].map((s,i)=>(
            <motion.div key={i} className="absolute inset-0 rounded-full border border-blue-300"
              style={{transform:`scale(${s})`}}
              animate={{rotate:i%2===0?360:-360}} transition={{duration:12+i*5,repeat:Infinity,ease:'linear'}}/>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 relative overflow-hidden">
        <Starfield count={40}/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_35%,rgba(99,102,241,0.07),transparent_55%)]"/>
        <motion.div initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{duration:0.5}}
          className="relative z-10 w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex justify-center mb-7 lg:hidden">
            <img src="/logo.png" alt="" className="w-16 h-16 object-contain"
              style={{filter:'drop-shadow(0 0 16px rgba(59,130,246,0.5))'}}/>
          </div>

          <div className="bg-white/[0.05] border border-white/[0.10] rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-sm">
            {/* Back navigation */}
            <button onClick={handleBack}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs font-semibold mb-5 transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"/>
              Go back
            </button>
            <div className="flex items-center gap-2.5 mb-1">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0"/>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back</h1>
            </div>
            <p className="text-white/35 text-sm mb-7">Sign in to your CAIE Scholar account</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email field */}
              <div>
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"/>
                  <input type="email" autoComplete="email" placeholder="you@example.com"
                    value={email}
                    onChange={e=>{ setEmail(e.target.value); setEmailState('idle'); setError(''); }}
                    onBlur={handleEmailBlur}
                    className={`${inputCls} pl-11 pr-10`}/>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {emailState==='checking' && <Loader2 className="w-4 h-4 text-white/30 animate-spin"/>}
                    {emailState==='found'    && <CheckCircle className="w-4 h-4 text-green-400"/>}
                    {emailState==='notfound' && <span className="text-amber-400 text-sm font-black leading-none">?</span>}
                  </div>
                </div>
                <AnimatePresence>
                  {emailState==='notfound' && (
                    <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="text-xs text-amber-400/80 mt-1.5 px-1">
                      No account found —{' '}
                      <Link to="/signup" className="font-bold underline hover:text-amber-300 transition-colors">create one free</Link>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Password</label>
                  <button type="button" onClick={()=>setShowForgot(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"/>
                  <input type={showPwd?'text':'password'} autoComplete="current-password" placeholder="••••••••"
                    value={password} onChange={e=>{ setPassword(e.target.value); setError(''); }}
                    className={`${inputCls} pl-11 pr-11`}/>
                  <button type="button" onClick={()=>setShowPwd(v=>!v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-0.5">
                    {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                    className="flex items-center gap-2 bg-red-500/15 text-red-300 rounded-xl px-4 py-3 text-sm border border-red-500/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={loading}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-900/30 gap-2 transition-all mt-1">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Signing in…</> : <>Sign in <ArrowRight className="w-4 h-4"/></>}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
              <p className="text-white/35 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">Create one free</Link>
              </p>
            </div>
          </div>

          <p className="text-center text-white/20 text-xs mt-5">No credit card · No ads · Data stays in your browser</p>
        </motion.div>
      </div>
    </div>
  );
}
