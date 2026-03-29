/**
 * SharedNotes.jsx — Public viewer for a shared AI notes session.
 * Route: /shared/notes/:shareId  (no login needed)
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function SharedNotes() {
  const { shareId } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!shareId) return;
    fetch(`${BACKEND}/api/share/${shareId}`)
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Session not found or expired' : `Error ${r.status}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [shareId]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-400 animate-spin"/>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#05071a] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4"/>
        <h2 className="text-xl font-bold text-white mb-2">Notes not found</h2>
        <p className="text-white/50 text-sm mb-6">{error}</p>
        <Link to="/"><Button className="bg-blue-600 text-white rounded-xl">Go to CAIE Scholar</Button></Link>
      </div>
    </div>
  );

  const { subject, topic, examType, notes, diagrams = [] } = data || {};

  return (
    <div className="min-h-screen bg-[#05071a]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold bg-white/15 text-white/70 px-3 py-1 rounded-full border border-white/10">{examType}</span>
              <span className="text-xs text-white/40">Shared study notes</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{subject}</h1>
            <p className="text-purple-200/70 mt-1">{topic}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={copyLink}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl gap-1.5">
              <Share2 className="w-3.5 h-3.5"/>Copy link
            </Button>
            <Link to="/signup">
              <Button size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl gap-1.5">
                <ExternalLink className="w-3.5 h-3.5"/>Try CAIE Scholar free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {notes?.hook && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            className="text-lg text-blue-200/80 italic border-l-4 border-blue-500 pl-5 py-3 bg-blue-500/10 rounded-r-2xl leading-relaxed">
            {notes.hook}
          </motion.div>
        )}
        {notes?.memory_hook && (
          <div className="flex items-start gap-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
            <span className="text-2xl">🧠</span>
            <div>
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">Memory hook</p>
              <p className="text-white/80 text-sm leading-relaxed">{notes.memory_hook}</p>
            </div>
          </div>
        )}
        {(notes?.sections || []).map((s, i) => (
          <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.07] bg-white/[0.03]">
              <h2 className="text-lg font-black text-white">{i+1}. {s.title}</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-white/75 leading-relaxed">{s.prose}</p>
              {diagrams[i] && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  {diagrams[i].startsWith('data:image')
                    ? <img src={diagrams[i]} alt={s.title} className="w-full rounded-xl"/>
                    : <div dangerouslySetInnerHTML={{__html: diagrams[i]}} className="max-w-full overflow-auto"/>}
                </div>
              )}
              {s.worked_example && (
                <div className="bg-green-500/10 border-l-4 border-green-500 rounded-r-xl p-4">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Worked Example</p>
                  <pre className="text-sm text-green-200/80 whitespace-pre-wrap font-mono">{s.worked_example}</pre>
                </div>
              )}
              {s.common_error && (
                <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-4 flex items-start gap-2">
                  <span className="text-amber-400 flex-shrink-0">⚠</span>
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Common mistake</p>
                    <p className="text-sm text-amber-200/80">{s.common_error}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {(notes?.practice_questions || []).length > 0 && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.07]">
              <h2 className="text-lg font-black text-white">Practice Questions</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              {notes.practice_questions.map((q, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                  <p className="text-white/75 text-sm leading-relaxed">{typeof q==='string'?q:q.question}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="text-center py-8 border-t border-white/[0.07]">
          <p className="text-white/40 text-sm mb-4">These notes were generated by CAIE Scholar</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold px-8">
                Create your free account
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8">
                Learn more
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
