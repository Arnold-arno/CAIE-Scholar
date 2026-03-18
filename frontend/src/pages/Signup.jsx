import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2,
  AlertCircle, CheckCircle, Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarCircle from '@/components/ui/avatar';
import AvatarPicker from '@/components/ui/avatar-picker';
import { useAppContext } from '@/context/AppContext';

const LEVELS = ['IGCSE', 'AS & A-Level', 'O-Level', 'All levels'];

function StrengthBar({ password }) {
  const score = [/.{8,}/, /[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter(r => r.test(password)).length;
  const cols  = ['','bg-red-400','bg-orange-400','bg-yellow-400','bg-green-400','bg-green-500'];
  const labs  = ['','Weak','Fair','Good','Strong','Very strong'];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i<=score?cols[score]:'bg-gray-200'}`}/>)}
      </div>
      <p className={`text-xs ${score<3?'text-red-500':score<4?'text-yellow-600':'text-green-600'}`}>{labs[score]}</p>
    </div>
  );
}

export default function Signup() {
  const [form,        setForm]        = useState({ name: '', email: '', password: '', confirm: '' });
  const [avatar,      setAvatar]      = useState(null);
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [level,       setLevel]       = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [step,        setStep]        = useState(1);  // 1=details, 2=avatar, 3=level

  const { signup } = useAppContext();
  const navigate   = useNavigate();
  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = async () => {
    if (!level) { setError('Please select your exam level'); return; }
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 600));
      signup(form.name, form.email, avatar);
      navigate('/onboarding');
    } catch { setError('Failed to create account. Please try again.'); }
    finally { setLoading(false); }
  };

  const previewUser = { name: form.name, email: form.email, avatar };

  return (
    <div className="min-h-screen flex">
      {/* ── Left — logo ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#05071a]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(59,130,246,0.15),transparent_60%)]"/>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(220,38,38,0.12),transparent_50%)]"/>
          {Array.from({length:60}).map((_,i)=>(
            <div key={i} className="absolute rounded-full bg-white" style={{
              width:`${Math.random()*2+1}px`, height:`${Math.random()*2+1}px`,
              top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
              opacity:Math.random()*0.6+0.2,
            }}/>
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.img src="/logo.png" alt="CAIE Scholar"
            className="w-full max-w-md drop-shadow-2xl"
            style={{filter:'drop-shadow(0 0 40px rgba(59,130,246,0.4))'}}
            initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{duration:0.8}}/>
          <motion.p className="text-blue-200 text-lg font-light mt-6"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
            Your Cambridge exam companion
          </motion.p>
          <p className="text-blue-400/70 text-sm mt-1">IGCSE · AS & A-Level · O-Level</p>
        </div>
      </div>

      {/* ── Right — form ─────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <img src="/logo.png" alt="CAIE Scholar" className="w-28 h-28 object-contain"/>
          </div>

          {/* Step indicator — 3 steps */}
          <div className="flex items-center gap-2 mb-8">
            {[1,2,3].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > s ? 'bg-green-500 text-white' :
                  step === s ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white scale-110' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle className="w-4 h-4"/> : s}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 transition-colors ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}/>}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Step 1: Account details ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Create account</h1>
                <p className="text-gray-500 mb-6 text-sm">Join CAIE Scholar for free</p>
                <form onSubmit={handleStep1} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Full name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input placeholder="Your name" value={form.name} onChange={update('name')} className="pl-10 h-11 border-2 border-gray-200 rounded-xl"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} className="pl-10 h-11 border-2 border-gray-200 rounded-xl"/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input type={showPwd?'text':'password'} placeholder="Min 8 characters" value={form.password} onChange={update('password')} className="pl-10 pr-10 h-11 border-2 border-gray-200 rounded-xl"/>
                      <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                    <StrengthBar password={form.password}/>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Confirm password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <Input type="password" placeholder="Repeat password" value={form.confirm} onChange={update('confirm')}
                        className={`pl-10 h-11 border-2 rounded-xl ${form.confirm&&form.password!==form.confirm?'border-red-300':'border-gray-200'}`}/>
                    </div>
                  </div>
                  <AnimatePresence>
                    {error && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                      className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
                    </motion.div>}
                  </AnimatePresence>
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl">
                    Continue <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: Profile photo ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Add a profile photo</h1>
                <p className="text-gray-500 mb-8 text-sm">Optional — upload, paste a URL, or pick a built-in avatar</p>

                <div className="flex flex-col items-center gap-6">
                  {/* Avatar preview — click to open picker */}
                  <div className="relative cursor-pointer group" onClick={() => setPickerOpen(true)}>
                    <AvatarCircle user={previewUser} size={108}
                      className="ring-4 ring-blue-100 shadow-xl group-hover:ring-blue-300 transition-all" />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <Button variant="outline" onClick={() => setPickerOpen(true)}
                      className="gap-2 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl h-11 px-8">
                      <Camera className="w-4 h-4" />
                      {avatar ? 'Change photo' : 'Choose a photo'}
                    </Button>
                    {avatar && (
                      <button onClick={() => setAvatar(null)}
                        className="block mx-auto mt-2 text-xs text-gray-400 hover:text-red-500 transition-colors">
                        Remove photo
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 text-center max-w-xs">
                    Upload from your computer, paste a URL, pick from Google Photos, or choose one of our built-in avatars.
                  </p>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button variant="outline" onClick={() => { setStep(1); setError(''); }} className="flex-1 h-11 rounded-xl border-2">Back</Button>
                  <Button onClick={() => { setError(''); setStep(3); }} className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl">
                    {avatar ? 'Looks good!' : 'Skip for now'} <ArrowRight className="w-4 h-4 ml-2"/>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Exam level ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Your exam level</h1>
                <p className="text-gray-500 mb-6 text-sm">Which Cambridge exam are you preparing for?</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                        level === l ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {level === l && <CheckCircle className="w-4 h-4 text-blue-500 mb-1.5"/>}
                      {l}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {error && <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                    className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200 mb-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
                  </motion.div>}
                </AnimatePresence>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setStep(2); setError(''); }} className="flex-1 h-11 rounded-xl border-2">Back</Button>
                  <Button onClick={handleSubmit} disabled={loading || !level}
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Creating…</> : <>Get started <ArrowRight className="w-4 h-4 ml-2"/></>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="font-semibold text-blue-600">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Avatar picker modal */}
      <AvatarPicker
        currentAvatar={avatar}
        userName={form.name}
        userEmail={form.email}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={(data) => { setAvatar(data); }}
      />
    </div>
  );
}
