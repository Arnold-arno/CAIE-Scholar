/**
 * Signup.jsx — 4-step dark-space signup.
 * Steps: 1=details → 2=avatar → 3=verify email → 4=exam level
 * Wired to auth.js (stub by default; set VITE_AUTH_PROVIDER=supabase|firebase for real auth)
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2,
  AlertCircle, CheckCircle, Camera, Upload, ShieldCheck, RefreshCw, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarCircle from '@/components/ui/avatar';
import AvatarPicker from '@/components/ui/avatar-picker';
import { useAppContext } from '@/context/AppContext';
import { signUp, sendOTP, verifyOTP } from '@/lib/auth';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

// ── Starfield ─────────────────────────────────────────────────────────────────
function Starfield({ count = 60 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id:i, x:Math.random()*100, y:Math.random()*100,
    r:Math.random()*1.8+0.4, op:Math.random()*0.45+0.12,
    dur:Math.random()*6+4, delay:Math.random()*-8,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{left:`${s.x}%`,top:`${s.y}%`,width:s.r,height:s.r,opacity:s.op}}
          animate={{opacity:[s.op,s.op*2.2,s.op]}}
          transition={{duration:s.dur,delay:s.delay,repeat:Infinity,ease:'easeInOut'}}/>
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(59,130,246,0.15),transparent_55%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(139,92,246,0.12),transparent_50%)]"/>
    </div>
  );
}

// ── Password strength bar ─────────────────────────────────────────────────────
function StrengthBar({ password }) {
  const score = [/.{8,}/,/[a-z]/,/[A-Z]/,/[0-9]/,/[^a-zA-Z0-9]/].filter(r=>r.test(password)).length;
  const cols  = ['','bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400','bg-green-500'];
  const labs  = ['','Weak','Fair','Good','Strong','Very strong'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i<=score?cols[score]:'bg-white/10'}`}/>)}
      </div>
      <p className={`text-xs ${score<3?'text-red-400':score<4?'text-yellow-400':'text-green-400'}`}>{labs[score]}</p>
    </div>
  );
}

const inputCls = 'w-full h-12 bg-white/[0.07] border border-white/15 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all px-4';

export default function Signup() {
  const [form,        setForm]       = useState({name:'',email:'',password:'',confirm:''});
  const [avatar,      setAvatar]     = useState(null);
  const [level,       setLevel]      = useState('');
  const [showPwd,     setShowPwd]    = useState(false);
  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState('');
  const [step,        setStep]       = useState(1);
  const [pickerOpen,  setPickerOpen] = useState(false);

  // OTP state
  const [secretCode,   setSecretCode]   = useState('');
  const [enteredCode,  setEnteredCode]  = useState('');
  const [codeExpiry,   setCodeExpiry]   = useState(null);
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [codeSending,  setCodeSending]  = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  const { signup } = useAppContext();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { confirm, ConfirmUI } = useConfirm();

  // True if user has entered any data that would be lost on leaving
  const hasEnteredData = form.name.trim() || form.email.trim() || form.password || avatar;
  const update = k => e => setForm(p => ({...p, [k]: e.target.value}));

  // Browser beforeunload warning — fires when closing tab/window mid-form
  useEffect(() => {
    const handler = e => {
      if (hasEnteredData && step < 4) {
        e.preventDefault();
        e.returnValue = ''; // required for Chrome
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasEnteredData, step]);

  // Countdown
  useEffect(() => {
    if (!codeExpiry) return;
    const iv = setInterval(() => {
      const r = Math.max(0, Math.ceil((codeExpiry - Date.now()) / 1000));
      setTimeLeft(r);
      if (r === 0) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, [codeExpiry]);

  const handleBack = async () => {
    if (hasEnteredData) {
      const yes = await confirm({
        title: 'Leave sign up?',
        message: `You've entered some information — name, email${avatar ? ', and a profile photo' : ''}. All of it will be cleared if you leave now.`,
        confirmLabel: 'Leave anyway',
        cancelLabel: 'Keep going',
        danger: false,
        icon: 'warn',
      });
      if (!yes) return;
    }
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  };

  const sendCode = useCallback(async () => {
    setCodeSending(true); setCodeVerified(false); setEnteredCode('');
    setCodeExpiry(Date.now() + 5*60*1000); setTimeLeft(300);
    try {
      const { code, error } = await sendOTP(form.email);
      if (error) { toast.error(`Could not send code: ${error}`); }
      else {
        // Stub returns the code so it can be shown in dev; real providers email it
        if (code) setSecretCode(code);
        else setSecretCode(''); // real provider — user checks email
        toast.info(`Verification code sent to ${form.email}`, { duration: 4000 });
      }
    } catch { toast.error('Could not send verification code'); }
    finally { setCodeSending(false); }
  }, [form.email]);

  const handleOtpDigit = (idx, val) => {
    const d = enteredCode.padEnd(6,' ').split('');
    d[idx] = val.slice(-1);
    const next = d.join('').replace(/ /g,'');
    setEnteredCode(next);
    if (val && idx < 5) otpRefs[idx+1].current?.focus();
  };
  const handleOtpKey = (idx, e) => {
    if (e.key==='Backspace' && !enteredCode[idx] && idx>0) otpRefs[idx-1].current?.focus();
  };

  const verifyCode = async () => {
    if (timeLeft === 0) { setError('Code expired — request a new one'); return; }
    try {
      const { verified, error } = await verifyOTP(form.email, enteredCode, secretCode);
      if (verified) { setCodeVerified(true); setError(''); toast.success('Email verified!'); }
      else setError(error || 'Incorrect code. Try again.');
    } catch { setError('Verification failed. Try again.'); }
  };

  const handleStep1 = e => {
    e.preventDefault();
    if (!form.name.trim())  { setError('Enter your full name'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Enter a valid email address'); return; }
    if (!form.password)     { setError('Choose a password'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = async () => {
    if (!level) { setError('Please select your exam level'); return; }
    setLoading(true); setError('');
    try {
      const { user, error: authErr } = await signUp(form.name.trim(), form.email.trim(), form.password);
      if (authErr) { setError(authErr); return; }
      signup(user?.name || form.name.trim(), user?.email || form.email.trim(), avatar);
      toast.success('Account created! Welcome to CAIE Scholar.');
      navigate('/onboarding');
    } catch { setError('Failed to create account. Try again.'); }
    finally { setLoading(false); }
  };

  const previewUser = { name: form.name, email: form.email, avatar };

  // Step indicator
  const Steps = () => (
    <div className="flex items-center gap-2 mb-7">
      {[1,2,3,4].map((n,i) => (
        <React.Fragment key={n}>
          <motion.div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
            step>n  ? 'bg-green-500 text-white scale-90'
            :step===n ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 shadow-lg shadow-blue-900/40'
            : 'bg-white/[0.07] text-white/30 border border-white/10'
          }`}>
            {step>n ? <CheckCircle className="w-4 h-4"/> : n}
          </motion.div>
          {i<3 && <div className={`flex-1 h-px transition-all duration-500 ${step>n?'bg-green-500':'bg-white/[0.08]'}`}/>}
        </React.Fragment>
      ))}
    </div>
  );

  const ErrBanner = () => (
    <AnimatePresence>
      {error && (
        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
          className="flex items-center gap-2 bg-red-500/15 text-red-300 rounded-xl px-4 py-3 text-sm border border-red-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen flex bg-[#05071a]">
      <ConfirmUI/>
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden border-r border-white/[0.06] flex-col">
        <Starfield count={90}/>
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-10 gap-6 text-center">
          <motion.img src="/logo.png" alt="CAIE Scholar"
            className="w-44 h-44 object-contain drop-shadow-2xl"
            style={{filter:'drop-shadow(0 0 55px rgba(59,130,246,0.55))'}}
            initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1,y:[0,-10,0]}}
            transition={{opacity:{duration:0.9},scale:{duration:0.9},y:{duration:5,repeat:Infinity,ease:'easeInOut',delay:1}}}
          />
          <div>
            <h1 className="text-4xl font-black"><span className="text-blue-400">CAIE</span><span className="text-red-400 ml-2">Scholar</span></h1>
            <p className="text-blue-200/55 mt-2">Cambridge · IGCSE · A-Level · O-Level</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs">
            {[['📚','Past papers'],['🤖','AI notes'],['⏱','Study timer'],['🌍','7 languages']].map(([e,l])=>(
              <div key={l} className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5">
                <span className="text-lg">{e}</span>
                <span className="text-xs text-white/55 font-medium">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs">Free · No ads · Private</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 relative overflow-hidden">
        <Starfield count={35}/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_40%,rgba(99,102,241,0.06),transparent_55%)]"/>
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{duration:0.5}}
          className="relative z-10 w-full max-w-[440px]">

          {/* Back button */}
          <button onClick={handleBack}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/65 text-xs font-semibold mb-5 transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"/>
            Go back
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src="/logo.png" alt="" className="w-14 h-14 object-contain"
              style={{filter:'drop-shadow(0 0 14px rgba(59,130,246,0.5))'}}/>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.09] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <Steps/>

            <AnimatePresence mode="wait">

              {/* Step 1 — Details */}
              {step===1 && (
                <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-blue-400"/>
                    <h2 className="text-2xl font-black text-white">Create account</h2>
                  </div>
                  <p className="text-white/35 text-sm mb-6">Join Cambridge students on CAIE Scholar</p>
                  <form onSubmit={handleStep1} className="space-y-4" noValidate>
                    {[
                      {k:'name',    type:'text',     icon:User, ph:'Your full name',      ac:'name'},
                      {k:'email',   type:'email',    icon:Mail, ph:'you@example.com',     ac:'email'},
                    ].map(({k,type,icon:Icon,ph,ac}) => (
                      <div key={k}>
                        <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 block">{k==='name'?'Full name':'Email address'}</label>
                        <div className="relative">
                          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"/>
                          <input type={type} autoComplete={ac} placeholder={ph}
                            value={form[k]} onChange={update(k)}
                            className={`${inputCls} pl-11`}/>
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"/>
                        <input type={showPwd?'text':'password'} autoComplete="new-password" placeholder="Min 8 characters"
                          value={form.password} onChange={update('password')}
                          className={`${inputCls} pl-11 pr-11`}/>
                        <button type="button" onClick={()=>setShowPwd(v=>!v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                          {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                      <StrengthBar password={form.password}/>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2 block">Confirm password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"/>
                        <input type="password" autoComplete="new-password" placeholder="Repeat password"
                          value={form.confirm} onChange={update('confirm')}
                          className={`${inputCls} pl-11 ${form.confirm&&form.password!==form.confirm?'border-red-500/60':''}`}/>
                      </div>
                    </div>
                    <ErrBanner/>
                    <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-2 shadow-lg shadow-blue-900/30">
                      Continue <ArrowRight className="w-4 h-4"/>
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 2 — Avatar */}
              {step===2 && (
                <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <h2 className="text-2xl font-black text-white mb-1">Add a profile photo</h2>
                  <p className="text-white/35 text-sm mb-7">Optional — personalises your dashboard</p>
                  <div className="flex flex-col items-center gap-5 mb-7">
                    <div className="relative cursor-pointer group" onClick={()=>setPickerOpen(true)}>
                      <div className="w-24 h-24 rounded-full ring-4 ring-blue-500/30 shadow-xl shadow-blue-900/30">
                        <AvatarCircle user={previewUser} size={96}/>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white"/>
                      </div>
                    </div>
                    <Button variant="outline" onClick={()=>setPickerOpen(true)}
                      className="gap-2 border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 rounded-xl h-10 px-5">
                      <Upload className="w-4 h-4"/>{avatar ? 'Change photo' : 'Choose photo'}
                    </Button>
                    <p className="text-xs text-white/25 text-center max-w-xs">Upload, paste a URL, or pick a built-in avatar. You can crop and adjust position.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={()=>{setStep(1);setError('');}}
                      className="flex-1 h-11 border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 rounded-xl">Back</Button>
                    <Button onClick={()=>{setError('');setStep(3);sendCode();}}
                      className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl gap-2">
                      {avatar ? 'Looks great!' : 'Skip for now'} <ArrowRight className="w-4 h-4"/>
                    </Button>
                  </div>
                  <AvatarPicker currentAvatar={avatar} userName={form.name} userEmail={form.email}
                    open={pickerOpen} onClose={()=>setPickerOpen(false)}
                    onSave={d=>{setAvatar(d);setPickerOpen(false);}}/>
                </motion.div>
              )}

              {/* Step 3 — Verify email */}
              {step===3 && (
                <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${codeVerified?'bg-green-500/20 ring-2 ring-green-400/30':'bg-blue-500/15 ring-2 ring-blue-500/25'}`}>
                      {codeVerified ? <CheckCircle className="w-7 h-7 text-green-400"/> : <ShieldCheck className="w-7 h-7 text-blue-400"/>}
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">
                      {codeVerified ? 'Email verified!' : 'Verify your email'}
                    </h2>
                    <p className="text-white/40 text-sm max-w-sm">
                      {codeVerified
                        ? 'Your account is ready. Continue to choose your level.'
                        : <>We sent a 6-digit code to <strong className="text-white/70">{form.email}</strong></>}
                    </p>
                  </div>
                  {!codeVerified && (
                    <>
                      {/* Show code in stub/dev mode */}
                      {secretCode && !codeSending && (
                        <div className="mb-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                          <p className="text-xs text-blue-400 font-semibold mb-1.5">📧 Demo — code shown here (production emails it)</p>
                          <p className="text-3xl font-mono font-black tracking-[0.3em] text-white">{secretCode}</p>
                          <p className="text-xs text-white/35 mt-1.5">
                            {timeLeft>0 ? `Expires in ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}` : <span className="text-red-400">Expired</span>}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 justify-center mb-5">
                        {Array.from({length:6}).map((_,i)=>(
                          <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1}
                            value={enteredCode[i]||''}
                            onChange={e=>handleOtpDigit(i,e.target.value)}
                            onKeyDown={e=>handleOtpKey(i,e)}
                            className="w-10 sm:w-11 h-14 text-center text-xl font-black bg-white/[0.07] border border-white/15 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"/>
                        ))}
                      </div>
                      <ErrBanner/>
                      <Button onClick={verifyCode} disabled={enteredCode.length<6}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl mb-3 disabled:opacity-50">
                        Verify code
                      </Button>
                      <div className="flex items-center justify-center gap-2 text-sm text-white/35">
                        Didn't get it?
                        <button onClick={sendCode} disabled={codeSending||timeLeft>240}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-40 transition-colors">
                          <RefreshCw className={`w-3.5 h-3.5 ${codeSending?'animate-spin':''}`}/>
                          {codeSending?'Sending…':timeLeft>240?`Resend in ${timeLeft-240}s`:'Resend code'}
                        </button>
                      </div>
                    </>
                  )}
                  {codeVerified && (
                    <Button onClick={()=>{setStep(4);setError('');}}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl mt-2 gap-2">
                      Continue <ArrowRight className="w-4 h-4"/>
                    </Button>
                  )}
                </motion.div>
              )}

              {/* Step 4 — Exam level */}
              {step===4 && (
                <motion.div key="s4" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <h2 className="text-2xl font-black text-white mb-1">Choose your level</h2>
                  <p className="text-white/35 text-sm mb-6">Which Cambridge qualification are you studying for?</p>
                  <div className="space-y-3 mb-6">
                    {[
                      {l:'IGCSE',        desc:'International General Certificate of Secondary Education', emoji:'📘', accent:'from-blue-500 to-indigo-600'},
                      {l:'AS & A-Level', desc:'General Certificate of Education — Advanced Level',       emoji:'📙', accent:'from-amber-500 to-red-500'},
                      {l:'O-Level',      desc:'General Certificate of Education — Ordinary Level',       emoji:'📗', accent:'from-emerald-500 to-teal-600'},
                    ].map(({l,desc,emoji,accent})=>(
                      <button key={l} onClick={()=>setLevel(l)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                          level===l ? 'border-blue-500/50 bg-blue-500/12 shadow-lg shadow-blue-900/20' : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
                        }`}>
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-xl flex-shrink-0 shadow-md`}>{emoji}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-base ${level===l?'text-blue-300':'text-white'}`}>{l}</p>
                          <p className="text-xs text-white/35 mt-0.5 truncate">{desc}</p>
                        </div>
                        {level===l && <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0"/>}
                      </button>
                    ))}
                  </div>
                  <ErrBanner/>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={()=>{setStep(3);setError('');}}
                      className="flex-1 h-11 border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 rounded-xl">Back</Button>
                    <Button onClick={handleSubmit} disabled={loading||!level}
                      className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/30 gap-2 disabled:opacity-50">
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Creating…</> : <>Get started! <ArrowRight className="w-4 h-4"/></>}
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <p className="text-center text-white/25 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
