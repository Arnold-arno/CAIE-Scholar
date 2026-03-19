import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const { login }  = useAppContext();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      // Stub auth — replace with Supabase/Firebase/your own API
      await new Promise(r => setTimeout(r, 600));
      login(email);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — logo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#05071a]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(59,130,246,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(220,38,38,0.12),transparent_50%)]" />
          {Array.from({length:60}).map((_,i)=>(
            <div key={i} className="absolute rounded-full bg-white" style={{
              width:`${Math.random()*2+1}px`,height:`${Math.random()*2+1}px`,
              top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,
              opacity:Math.random()*0.6+0.2
            }}/>
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <motion.img src="/logo.png" alt="CAIE Scholar"
            className="w-full max-w-md drop-shadow-2xl"
            style={{filter:'drop-shadow(0 0 40px rgba(59,130,246,0.4))'}}
            initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} transition={{duration:0.8}}
          />
          <motion.p className="text-blue-200 text-lg font-light mt-6"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
            Your Cambridge exam companion
          </motion.p>
          <p className="text-blue-400/70 text-sm mt-1">IGCSE · AS & A-Level · O-Level</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#07091e] px-6 py-12">
        <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/logo.png" alt="CAIE Scholar" className="w-36 h-36 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 mb-8 text-sm">Sign in to CAIE Scholar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-200">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}
                  className="pl-10 h-11 border-2 border-white/10 rounded-xl bg-white/8 text-white placeholder-gray-500" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-200">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type={showPwd?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-2 border-white/10 rounded-xl bg-white/8 text-white placeholder-gray-500" />
                <button type="button" onClick={()=>setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                  className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0"/>{error}
                </motion.div>
              )}
            </AnimatePresence>
            <Button type="submit" disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl">
              {loading?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Signing in…</>:<>Sign in<ArrowRight className="w-4 h-4 ml-2"/></>}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <Link to="/signup" className="font-semibold text-blue-600">Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
