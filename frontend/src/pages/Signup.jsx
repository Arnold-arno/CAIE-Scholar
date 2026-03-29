/**
 * Signup.jsx — 4-step dark-space signup with OTP verification.
 * Steps: 1=account details → 2=avatar → 3=email verify → 4=exam level
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2,
  AlertCircle, CheckCircle, Camera, Upload, ShieldCheck, RefreshCw,
  Sparkles, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AvatarCircle from '@/components/ui/avatar';
import AvatarPicker from '@/components/ui/avatar-picker';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

// ── Shared cosmos background helpers ─────────────────────────────────────────
function Starfield({ count = 70 }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    r: Math.random() * 1.8 + 0.4, op: Math.random() * 0.5 + 0.15,
    dur: Math.random() * 6 + 4, delay: Math.random() * -8,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.r, height:s.r, opacity:s.op }}
          animate={{ opacity:[s.op, s.op*2, s.op] }}
          transition={{ duration:s.dur, delay:s.delay, repeat:Infinity, ease:'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(59,130,246,0.15),transparent_55%)]"/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(139,92,246,0.12),transparent_50%)]"/>
    </div>
  );
}

// ── Password strength ─────────────────────────────────────────────────────────
function StrengthBar({ password }) {
  const score = [/.{8,}/, /[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length;
  const cols  = ['','bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400','bg-green-500'];
  const labs  = ['','Weak','Fair','Good','Strong','Very strong'];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i<=score?cols[score]:'bg-white/10'}`}/>)}
      </div>
      <p className={`text-xs ${score<3?'text-red-400':score<4?'text-yellow-400':'text-green-400'}`}>{labs[score]}</p>
    </div>
  );
}

function makeCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

const inputCls = "w-full h-12 bg-white/[0.07] border border-white/15 rounded-xl text-white placeholder-white/30 text-base focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all px-4";

export default function Signup() {
  const [form,       setForm]       = useState({ name:'', email:'', password:'', confirm:'' });
  const [avatar,     setAvatar]     = useState(null);
  const [level,      setLevel]      = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [step,       setStep]       = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [enteredCode,setEnteredCode]= useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [codeSending,setCodeSending]= useState(false);
  const [codeVerified,setCodeVerified]=useState(false);
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const { signup } = useAppContext();
  const navigate   = useNavigate();
  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  useEffect(() => {
    if (!codeExpiry) return;
    const iv = setInterval(() => {
      const r = Math.max(0, Math.ceil((codeExpiry - Date.now()) / 1000));
      setTimeLeft(r);
      if (r === 0) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, [codeExpiry]);

  const sendCode = useCallback(() => {
    const code = makeCode();
    setSecretCode(code); setEnteredCode('');
    setCodeExpiry(Date.now() + 5 * 60 * 1000);
    setTimeLeft(300); setCodeVerified(false);
    setCodeSending(true);
    setTimeout(() => setCodeSending(false), 800);
    toast.info(`Verification code sent to ${form.email}`, { duration: 4000 });
  }, [form.email]);

  const handleOtpDigit = (idx, val) => {
    const digits = enteredCode.padEnd(6, ' ').split('');
    digits[idx] = val.slice(-1);
    const next = digits.join('').replace(/ /g,'');
    setEnteredCode(next);
    if (val && idx < 5) otpRefs[idx+1].current?.focus();
  };

  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !enteredCode[idx] && idx > 0) otpRefs[idx-1].current?.focus();
  };

  const verifyCode = () => {
    if (timeLeft === 0) { setError('Code expired — request a new one'); return; }
    if (enteredCode === secretCode) { setCodeVerified(true); setError(''); toast.success('Email verified!'); }
    else setError('Incorrect code. Try again.');
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password) { setError('Please fill in all fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = async () => {
    if (!level) { setError('Please select your exam level'); return; }
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 500));
      signup(form.name, form.email, avatar);
      navigate('/onboarding');
    } catch { setError('Failed to create account. Try again.'); }
    finally { setLoading(false); }
  };

  const previewUser = { name: form.name, email: form.email, avatar };

  // Step indicator
  const Steps = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1,2,3,4].map((n, i) => (
        <React.Fragment key={n}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
            step > n ? 'bg-green-500 text-white scale-90'
            : step === n ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white scale-110 shadow-lg shadow-blue-900/50'
            : 'bg-white/[0.07] text-white/30 border border-white/10'
          }`}>
            {step > n ? <CheckCircle className="w-4 h-4"/> : n}
          </div>
          {i < 3 && <div className={`flex-1 h-px transition-all duration-500 ${step > n ? 'bg-green-500' : 'bg-white/[0.08]'}`}/>}
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
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden border-r border-white/[0.06]">
        <Starfield count={90}/>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-10 gap-6 text-center">
          <motion.img src="/logo.png" alt="CAIE Scholar"
            className="w-48 h-48 object-contain drop-shadow-2xl"
            style={{ filter:'drop-shadow(0 0 60px rgba(59,130,246,0.6))' }}
            initial={{opacity:0,scale:0.8,y:0}}
            animate={{opacity:1,scale:1,y:[0,0,-10,0]}}
            transition={{opacity:{duration:0.9},scale:{duration:0.9},y:{duration:5,repeat:Infinity,ease:'easeInOut',delay:1}}}
          />
          <div>
            <h1 className="text-4xl font-black"><span className="text-blue-400">CAIE</span><span className="text-red-400 ml-2">Scholar</span></h1>
            <p className="text-blue-200/60 mt-2 text-base">Cambridge · IGCSE · A-Level · O-Level</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
            {[
              {icon:'📚', label:'Past papers'},
              {icon:'🤖', label:'AI notes'},
              {icon:'⏱', label:'Study timer'},
              {icon:'🌍', label:'7 languages'},
            ].map(f=>(
              <div key={f.label} className="flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5">
                <span className="text-lg">{f.icon}</span>
                <span className="text-xs text-white/60 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
          <p className="text-white/25 text-xs">Free · No ads · Private</p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-7/12 flex items-center justify-center relative overflow-hidden px-6 py-12">
        <Starfield count={40}/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(99,102,241,0.06),transparent_60%)]"/>

        <motion.div initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{duration:0.5}}
          className="relative z-10 w-full max-w-lg">
          <div className="lg:hidden flex justify-center mb-6">
            <img src="/logo.png" alt="" className="w-16 h-16 object-contain"
              style={{filter:'drop-shadow(0 0 16px rgba(59,130,246,0.5))'}}/>
          </div>

          <div className="bg-white/[0.04] border border-white/[0.09] rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
            <Steps/>

            <AnimatePresence mode="wait">

              {/* ── Step 1: Account details ── */}
              {step===1&&(
                <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-blue-400"/>
                    <h2 className="text-2xl font-black text-white">Create your account</h2>
                  </div>
                  <p className="text-white/40 text-sm mb-6">Join Cambridge students on CAIE Scholar</p>
                  <form onSubmit={handleStep1} className="space-y-4">
                    <div>
                      <Label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Full name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"/>
                        <input placeholder="Your name" value={form.name} onChange={update('name')} className={`${inputCls} pl-11`}/>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"/>
                        <input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} className={`${inputCls} pl-11`}/>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"/>
                        <input type={showPwd?'text':'password'} placeholder="Min 8 characters" value={form.password} onChange={update('password')} className={`${inputCls} pl-11 pr-11`}/>
                        <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                          {showPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                        </button>
                      </div>
                      <StrengthBar password={form.password}/>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Confirm password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"/>
                        <input type="password" placeholder="Repeat password" value={form.confirm} onChange={update('confirm')}
                          className={`${inputCls} pl-11 ${form.confirm&&form.password!==form.confirm?'border-red-500/50':''}`}/>
                      </div>
                    </div>
                    <ErrBanner/>
                    <Button type="submit" className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-900/40 gap-2">
                      Continue <ArrowRight className="w-4 h-4"/>
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── Step 2: Avatar ── */}
              {step===2&&(
                <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <h2 className="text-2xl font-black text-white mb-1">Add a profile photo</h2>
                  <p className="text-white/40 text-sm mb-7">Optional — personalises your dashboard</p>
                  <div className="flex flex-col items-center gap-5 mb-7">
                    <div className="relative cursor-pointer group" onClick={()=>setPickerOpen(true)}>
                      <div className="w-28 h-28 rounded-full ring-4 ring-blue-500/30 shadow-2xl shadow-blue-900/40">
                        <AvatarCircle user={previewUser} size={112}/>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-7 h-7 text-white"/>
                      </div>
                    </div>
                    <Button variant="outline" onClick={()=>setPickerOpen(true)}
                      className="gap-2 border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 rounded-xl h-11 px-6">
                      <Upload className="w-4 h-4"/>{avatar?'Change photo':'Choose photo'}
                    </Button>
                    <p className="text-xs text-white/30 text-center max-w-xs">
                      Upload, paste a URL, or pick a built-in avatar. You can crop and adjust position too.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={()=>{setStep(1);setError('');}}
                      className="flex-1 h-11 border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 rounded-xl">Back</Button>
                    <Button onClick={()=>{setError('');setStep(3);sendCode();}}
                      className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl gap-2">
                      {avatar?'Looks great!':'Skip for now'} <ArrowRight className="w-4 h-4"/>
                    </Button>
                  </div>
                  <AvatarPicker currentAvatar={avatar} userName={form.name} userEmail={form.email}
                    open={pickerOpen} onClose={()=>setPickerOpen(false)}
                    onSave={d=>{setAvatar(d);setPickerOpen(false);}}/>
                </motion.div>
              )}

              {/* ── Step 3: Verify email ── */}
              {step===3&&(
                <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <div className="flex flex-col items-center text-center mb-7">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${codeVerified?'bg-green-500/20 ring-2 ring-green-500/40':'bg-blue-500/15 ring-2 ring-blue-500/30'}`}>
                      {codeVerified?<CheckCircle className="w-8 h-8 text-green-400"/>:<ShieldCheck className="w-8 h-8 text-blue-400"/>}
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">{codeVerified?'Email verified!':'Verify your email'}</h2>
                    <p className="text-white/40 text-sm max-w-sm">
                      {codeVerified?'Your account is ready. Continue to choose your level.'
                        :<>We sent a 6-digit code to <strong className="text-white/70">{form.email}</strong></>}
                    </p>
                  </div>
                  {!codeVerified&&(
                    <>
                      {secretCode&&!codeSending&&(
                        <div className="mb-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                          <p className="text-xs text-blue-400 font-semibold mb-1">📧 Demo mode — code shown here</p>
                          <p className="text-3xl font-mono font-black tracking-[0.3em] text-white">{secretCode}</p>
                          {timeLeft>0?<p className="text-xs text-white/40 mt-1">Expires in {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</p>
                            :<p className="text-xs text-red-400 mt-1">Code expired</p>}
                        </div>
                      )}
                      <div className="flex gap-2 justify-center mb-5">
                        {Array.from({length:6}).map((_,i)=>(
                          <input key={i} ref={otpRefs[i]} type="text" inputMode="numeric" maxLength={1}
                            value={enteredCode[i]||''}
                            onChange={e=>handleOtpDigit(i,e.target.value)}
                            onKeyDown={e=>handleOtpKey(i,e)}
                            className="w-11 h-14 text-center text-xl font-black bg-white/[0.07] border border-white/15 rounded-xl text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all"
                          />
                        ))}
                      </div>
                      <ErrBanner/>
                      <Button onClick={verifyCode} disabled={enteredCode.length<6}
                        className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl mb-3">
                        Verify code
                      </Button>
                      <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                        Didn't get it?
                        <button onClick={sendCode} disabled={codeSending||timeLeft>240}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium disabled:opacity-40">
                          <RefreshCw className={`w-3.5 h-3.5 ${codeSending?'animate-spin':''}`}/>
                          {codeSending?'Sending…':timeLeft>240?`Resend in ${timeLeft-240}s`:'Resend code'}
                        </button>
                      </div>
                    </>
                  )}
                  {codeVerified&&(
                    <Button onClick={()=>{setStep(4);setError('');}}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl mt-2 gap-2">
                      Continue <ArrowRight className="w-4 h-4"/>
                    </Button>
                  )}
                </motion.div>
              )}

              {/* ── Step 4: Exam level ── */}
              {step===4&&(
                <motion.div key="s4" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
                  <h2 className="text-2xl font-black text-white mb-1">Choose your level</h2>
                  <p className="text-white/40 text-sm mb-6">Which Cambridge qualification are you preparing for?</p>
                  <div className="space-y-3 mb-6">
                    {[
                      {l:'IGCSE',        desc:'International General Certificate of Secondary Education', emoji:'📘'},
                      {l:'AS & A-Level', desc:'General Certificate of Education — Advanced Level',       emoji:'📙'},
                      {l:'O-Level',      desc:'General Certificate of Education — Ordinary Level',       emoji:'📗'},
                    ].map(({l,desc,emoji})=>(
                      <button key={l} onClick={()=>setLevel(l)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                          level===l
                            ? 'border-blue-500/60 bg-blue-500/15 shadow-lg shadow-blue-900/30'
                            : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]'
                        }`}>
                        <span className="text-2xl">{emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-base ${level===l?'text-blue-300':'text-white'}`}>{l}</p>
                          <p className="text-xs text-white/40 mt-0.5 truncate">{desc}</p>
                        </div>
                        {level===l&&<CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0"/>}
                      </button>
                    ))}
                  </div>
                  <ErrBanner/>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={()=>{setStep(3);setError('');}}
                      className="flex-1 h-11 border border-white/15 bg-white/[0.06] text-white hover:bg-white/10 rounded-xl">Back</Button>
                    <Button onClick={handleSubmit} disabled={loading||!level}
                      className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/40 gap-2">
                      {loading?<><Loader2 className="w-4 h-4 animate-spin"/>Creating…</>:<>Get started! <ArrowRight className="w-4 h-4"/></>}
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
