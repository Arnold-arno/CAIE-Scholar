/**
 * exam-timetable.jsx — Upcoming exam countdown on the Home dashboard.
 * Reads examDates + subjects from AppContext, shows next 6 exams sorted by date.
 */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

const LEVEL_META = {
  IGCSE:    { label:'IGCSE',        colour:'bg-blue-500/20 text-blue-300 border-blue-500/30',    path:'/AcademicHub' },
  AS_LEVEL: { label:'AS & A-Level', colour:'bg-amber-500/20 text-amber-300 border-amber-500/30', path:'/ASLevelHub' },
  O_LEVEL:  { label:'O-Level',      colour:'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', path:'/OLevelHub' },
};

function daysUntil(iso) {
  if (!iso) return null;
  const d = new Date(iso); d.setHours(0,0,0,0);
  const n = new Date(); n.setHours(0,0,0,0);
  return Math.ceil((d - n) / 86400000);
}

function urgency(days) {
  if (days === null) return null;
  if (days < 0)   return { Icon:CheckCircle,   c:'text-gray-500',  bg:'bg-gray-500/10',   label:'Past',     ring:'border-gray-500/20' };
  if (days === 0) return { Icon:AlertTriangle,  c:'text-red-400',   bg:'bg-red-500/15',    label:'Today!',   ring:'border-red-400/30' };
  if (days <= 7)  return { Icon:AlertTriangle,  c:'text-red-400',   bg:'bg-red-500/10',    label:`${days}d`, ring:'border-red-400/20' };
  if (days <= 30) return { Icon:Clock,          c:'text-amber-400', bg:'bg-amber-500/10',  label:`${days}d`, ring:'border-amber-400/20' };
  return               { Icon:Calendar,         c:'text-blue-400',  bg:'bg-blue-500/10',   label:`${days}d`, ring:'border-blue-400/20' };
}

export default function ExamTimetable() {
  const { examDates, subjects } = useAppContext();

  const upcoming = useMemo(() => {
    const items = [];
    for (const [level, map] of Object.entries(examDates || {})) {
      for (const [code, iso] of Object.entries(map || {})) {
        if (!iso) continue;
        const days = daysUntil(iso);
        if (days !== null && days < 0) continue;
        const name = (subjects[level] || []).find(s => s.code === code)?.name || code;
        items.push({ level, code, name, iso, days });
      }
    }
    return items.sort((a,b) => a.days - b.days).slice(0,6);
  }, [examDates, subjects]);

  if (!upcoming.length) return null;

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
      className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400"/>
          <p className="font-bold text-white text-sm">Upcoming Exams</p>
        </div>
        <span className="text-xs text-white/40">{upcoming.length} exam{upcoming.length!==1?'s':''}</span>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {upcoming.map((item, i) => {
          const u    = urgency(item.days);
          const meta = LEVEL_META[item.level];
          if (!u || !meta) return null;
          const dateStr = new Date(item.iso).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
          return (
            <motion.div key={`${item.level}-${item.code}`}
              initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
              className="flex items-center gap-3 px-5 py-3.5">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${u.bg} border ${u.ring} flex flex-col items-center justify-center`}>
                <u.Icon className={`w-4 h-4 ${u.c} mb-0.5`}/>
                <span className={`text-[10px] font-black leading-none ${u.c}`}>{u.label}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${meta.colour}`}>{meta.label}</span>
                  <span className="text-[10px] text-white/40">{dateStr}</span>
                </div>
              </div>
              <Link to={meta.path} className="flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-white/25 hover:text-white/60 transition-colors"/>
              </Link>
            </motion.div>
          );
        })}
      </div>
      <div className="px-5 py-3 border-t border-white/[0.07]">
        <p className="text-[10px] text-white/30">Set exam dates in the Study Timer tab on each hub</p>
      </div>
    </motion.div>
  );
}
