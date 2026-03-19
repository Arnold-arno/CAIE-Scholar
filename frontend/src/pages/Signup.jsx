/**
 * Signup.jsx — 4-step signup with OTP-style account verification.
 * Steps: 1=details → 2=avatar → 3=verify code → 4=pick exam level
 *
 * Verification: generates a 6-digit code and shows it in a "sent to email"
 * styled panel. In production, swap generateAndSendCode() with a real backend
 * call (POST /api/auth/send-code) that emails the code.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2,
  AlertCircle, CheckCircle, Camera, X, Upload, ShieldCheck, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarCircle from '@/components/ui/avatar';
import AvatarPicker from '@/components/ui/avatar-picker';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

const LEVELS = ['IGCSE', 'AS & A-Level', 'O-Level'];

function StrengthBar({ password }) {
  const score = [/.{8,}/, /[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length;
  const cols  = ['','bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400','bg-green-500'];
  const labs  = ['','Weak','Fair','Good','Strong','Very strong'];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i<=score?cols[score]:'bg-gray-200'}`}/>)}
      </div>
      <p className={`text-xs ${score<3?'text-red-500':score<4?'text-yellow-600':'text-green-600'}`}>{labs[score]}</p>
    </div>
  );
}

// Generate a 6-digit code
function makeCode() { return String(Math.floor(100000 + Math.random() * 900000)); }

export default function Signup() {
  const [form,       setForm]       = useState({ name:'', email:'', password:'', confirm:'' });
  const [avatar,     setAvatar]     = useState(null);
  const [level,      setLevel]      = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [step,       setStep]       = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);

  // OTP step
  const [secretCode, setSecretCode] = useState('');
  const [enteredCode,setEnteredCode]= useState('');
  const [codeExpiry, setCodeExpiry] = useState(null); // timestamp ms
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [codeSending,setCodeSending]= useState(false);
  const [codeVerified,setCodeVerified]=useState(false);
  const otpInputs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];

  const { signup } = useAppContext();
  const navigate   = useNavigate();
  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  // Countdown timer for code expiry
  useEffect(() => {
    if (!codeExpiry) return;
    const iv = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((codeExpiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(iv);
    }, 500);
    return () => clearInterval(iv);
  }, [codeExpiry]);

  const sendCode = useCallback(() => {
    const code = makeCode();
    setSecretCode(code);
    setEnteredCode('');
    setCodeExpiry(Date.now() + 5 * 60 * 1000); // 5 min
    setTimeLeft(300);
    setCodeVerified(false);
    setCodeSending(true);
    // Simulate brief "sending" delay
    setTimeout(() => { setCodeSending(false); }, 800);
    // In production: POST /api/auth/send-code { email: form.email, code }
    toast.info(`Verification code sent to ${form.email}`, { duration: 4000 });
  }, [form.email]);

  // OTP digit input handler
  const handleOtpDigit = (idx, val) => {
    const digits = enteredCode.padEnd(6, ' ').split('');
    digits[idx] = val.slice(-1);
    const next = digits.join('').replace(/ /g,'');
    setEnteredCode(next);
    if (val && idx < 5) otpInputs[idx+1].current?.focus();
  };

  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !enteredCode[idx] && idx > 0) {
      otpInputs[idx-1].current?.focus();
    }
  };

  const verifyCode = () => {
    if (timeLeft === 0) { setError('Code expired — please request a new one'); return; }
    if (enteredCode === secretCode) {
      setCodeVerified(true);
      setError('');
      toast.success('Email verified!');
    } else {
      setError('Incorrect code. Try again.');
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name||!form.email||!form.password) { setError('Please fill in all fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setStep(2);
  };

  const goToVerify = () => {
    setError(''); setStep(3); sendCode();
  };

  const handleSubmit = async () => {
    if (!level) { setError('Please select your exam level'); return; }
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 500));
      signup(form.name, form.email, avatar);
      navigate('/onboarding');
    } catch { setError('Failed to create account. Please try again.'); }
    finally { setLoading(false); }
  };

  const STEPS = 4;
  const previewUser = { name: form.name, email: form.email, avatar };
  const StepDots = () => (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({length:STEPS}).map((_,i) => (
        <React.Fragment key={i}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            step>i+1?'bg-green-500 text-white scale-95':step===i+1?'bg-gradient-to-br from-blue-600 to-indigo-700 text-white scale-110 shadow-lg shadow-blue-300':
            'bg-gray-100 text-gray-400'
          }`}>
            {step>i+1?<CheckCircle className="w-4 h-4"/>:i+1}
          </div>
          {i<STEPS-1&&<div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step>i+1?'bg-blue-600':'bg-gray-200'}`}/>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-[#05071a] flex-col items-center justify-center px-12">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(59,130,246,0.2),transparent_60%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(220,38,38,0.14),transparent_50%)]"/>
          {Array.from({length:70}).map((_,i)=>(
            <div key={i} className="absolute rounded-full bg-white" style={{
              width:`${Math.random()*2.5+0.5}px`,height:`${Math.random()*2.5+0.5}px`,
              top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,
              opacity:Math.random()*0.5+0.15
            }}/>
          ))}
        </div>
        <motion.img src="/logo.png" alt="CAIE Scholar"
          className="w-64 drop-shadow-2xl relative z-10"
          style={{filter:'drop-shadow(0 0 50px rgba(59,130,246,0.5))'}}
          initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{duration:0.9}}
        />
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
          className="relative z-10 text-center mt-8">
          <p className="text-blue-200 text-xl font-light">Your Cambridge exam companion</p>
          <p className="text-blue-400/60 text-sm mt-2">IGCSE · AS & A-Level · O-Level</p>
          <div className="flex justify-center gap-4 mt-6">
            {['📚 Past papers','🤖 AI notes','⏱ Study timer'].map(f=>(
              <span key={f} className="text-xs text-blue-300/70 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">{f}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} className="w-full max-w-lg">
          <div className="flex justify-center mb-6 lg:hidden">
            <img src="/logo.png" alt="CAIE Scholar" className="w-28 h-28 object-contain"/>
          </div>

          <StepDots/>

          <AnimatePresence mode="wait">
            {/* Step 1: Account details */}
            {step===1&&(
              <motion.div key="s1" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} transition={{duration:0.2}}>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Create your account</h1>
                <p className="text-gray-500 mb-7 text-sm">Join thousands of Cambridge students on CAIE Scholar</p>
                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Full name</Label>
                    <div className="relative mt-1.5"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input placeholder="Your name" value={form.name} onChange={update('name')} className="pl-10 h-12 text-base border-2 border-gray-200 rounded-xl"/>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Email address</Label>
                    <div className="relative mt-1.5"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} className="pl-10 h-12 text-base border-2 border-gray-200 rounded-xl"/>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Password</Label>
                    <div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input type={showPwd?'text':'password'} placeholder="Min 8 characters" value={form.password} onChange={update('password')} className="pl-10 pr-10 h-12 text-base border-2 border-gray-200 rounded-xl"/>
                      <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                    <StrengthBar password={form.password}/>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Confirm password</Label>
                    <div className="relative mt-1.5"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input type="password" placeholder="Repeat password" value={form.confirm} onChange={update('confirm')}
                        className={`pl-10 h-12 text-base border-2 rounded-xl ${form.confirm&&form.password!==form.confirm?'border-red-300':'border-gray-200'}`}/>
                    </div>
                  </div>
                  <AnimatePresence>{error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                    className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}</motion.div>}</AnimatePresence>
                  <Button type="submit" className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200">
                    Continue <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Avatar */}
            {step===2&&(
              <motion.div key="s2" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} transition={{duration:0.2}}>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Add a profile photo</h1>
                <p className="text-gray-500 mb-8 text-sm">Optional — helps personalise your dashboard</p>
                <div className="flex flex-col items-center gap-5">
                  <div className="relative cursor-pointer group" onClick={()=>setPickerOpen(true)}>
                    <AvatarCircle user={previewUser} size={100} className="ring-4 ring-blue-100 shadow-xl"/>
                    <div className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white"/>
                    </div>
                  </div>
                  <Button variant="outline" onClick={()=>setPickerOpen(true)}
                    className="gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl h-11 px-6">
                    <Upload className="w-4 h-4"/>{avatar?'Change photo':'Choose photo'}
                  </Button>
                  <p className="text-xs text-gray-400 text-center max-w-xs">Upload from your device, paste a URL, or choose from our built-in avatars. All photos stay in your browser.</p>
                </div>
                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={()=>{setStep(1);setError('');}} className="flex-1 h-11 rounded-xl border-2">Back</Button>
                  <Button onClick={goToVerify} className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl">
                    {avatar?'Looks great!':'Skip for now'} <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </div>
                <AvatarPicker currentAvatar={avatar} userName={form.name} userEmail={form.email}
                  open={pickerOpen} onClose={()=>setPickerOpen(false)}
                  onSave={data=>{setAvatar(data);setPickerOpen(false);}}/>
              </motion.div>
            )}

            {/* Step 3: Email verification */}
            {step===3&&(
              <motion.div key="s3" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} transition={{duration:0.2}}>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${codeVerified?'bg-green-100':'bg-blue-100'}`}>
                    {codeVerified
                      ? <CheckCircle className="w-8 h-8 text-green-600"/>
                      : <ShieldCheck className="w-8 h-8 text-blue-600"/>
                    }
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {codeVerified?'Email verified!':'Verify your email'}
                  </h1>
                  <p className="text-gray-500 text-sm max-w-sm">
                    {codeVerified
                      ? 'Your account is ready. Continue to choose your exam level.'
                      : <>We sent a 6-digit code to <strong className="text-gray-800">{form.email}</strong>. Enter it below to confirm your account.</>
                    }
                  </p>
                </div>

                {!codeVerified&&(
                  <>
                    {/* Demo: show the code since we have no real email server */}
                    {secretCode&&!codeSending&&(
                      <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                        <p className="text-xs text-blue-600 font-semibold mb-1">📧 Demo mode — code shown here (real app sends email)</p>
                        <p className="text-3xl font-mono font-bold tracking-[0.3em] text-blue-800">{secretCode}</p>
                        {timeLeft>0
                          ? <p className="text-xs text-blue-500 mt-1">Expires in {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</p>
                          : <p className="text-xs text-red-500 mt-1">Code expired</p>
                        }
                      </div>
                    )}

                    {/* OTP input */}
                    <div className="flex gap-2 justify-center mb-5">
                      {Array.from({length:6}).map((_,i)=>(
                        <input key={i} ref={otpInputs[i]}
                          type="text" inputMode="numeric" maxLength={1}
                          value={enteredCode[i]||''}
                          onChange={e=>handleOtpDigit(i,e.target.value)}
                          onKeyDown={e=>handleOtpKey(i,e)}
                          className="w-11 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                        />
                      ))}
                    </div>

                    <AnimatePresence>{error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200 mb-4">
                      <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}</motion.div>}</AnimatePresence>

                    <Button onClick={verifyCode} disabled={enteredCode.length<6}
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl mb-3">
                      Verify code
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      Didn't get it?
                      <button onClick={sendCode} disabled={codeSending||timeLeft>240}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40">
                        <RefreshCw className={`w-3.5 h-3.5 ${codeSending?'animate-spin':''}`}/>
                        {codeSending?'Sending…':timeLeft>240?`Resend in ${timeLeft-240}s`:'Resend code'}
                      </button>
                    </div>
                  </>
                )}

                {codeVerified&&(
                  <Button onClick={()=>{setStep(4);setError('');}}
                    className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl mt-4 gap-2">
                    Continue <ArrowRight className="w-4 h-4"/>
                  </Button>
                )}
              </motion.div>
            )}

            {/* Step 4: Exam level */}
            {step===4&&(
              <motion.div key="s4" initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} transition={{duration:0.2}}>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Choose your level</h1>
                <p className="text-gray-500 mb-7 text-sm">Which Cambridge qualification are you preparing for?</p>
                <div className="space-y-3 mb-7">
                  {[
                    {l:'IGCSE',       desc:'International General Certificate of Secondary Education', icon:'🎓'},
                    {l:'AS & A-Level',desc:'General Certificate of Education — Advanced Level',       icon:'📐'},
                    {l:'O-Level',     desc:'General Certificate of Education — Ordinary Level',       icon:'📖'},
                  ].map(({l,desc,icon})=>(
                    <button key={l} onClick={()=>setLevel(l)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        level===l?'border-blue-500 bg-blue-50 shadow-md shadow-blue-100':'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}>
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className={`font-bold text-base ${level===l?'text-blue-700':'text-gray-800'}`}>{l}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                      </div>
                      {level===l&&<CheckCircle className="w-5 h-5 text-blue-500 ml-auto flex-shrink-0 mt-0.5"/>}
                    </button>
                  ))}
                </div>
                <AnimatePresence>{error&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                  className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}</motion.div>}</AnimatePresence>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={()=>{setStep(3);setError('');}} className="flex-1 h-11 rounded-xl border-2">Back</Button>
                  <Button onClick={handleSubmit} disabled={loading||!level}
                    className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200">
                    {loading?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Creating…</>:<>Get started! <ArrowRight className="w-4 h-4 ml-2"/></>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-500 mt-7">
            Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
