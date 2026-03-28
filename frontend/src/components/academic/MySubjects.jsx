/**
 * MySubjects.jsx — with confirmation before removing a subject.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useI18n } from '@/context/I18nContext';

export default function MySubjects({ level, subjectMap = {}, accentClass = 'from-blue-600 to-indigo-700', onSearchSubject }) {
  const { subjects, addSubject, removeSubject } = useAppContext();
  const { confirm, ConfirmUI } = useConfirm();
  const { t } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [query,   setQuery]   = useState('');

  const mySubjects = subjects[level] || [];
  const available  = Object.entries(subjectMap)
    .map(([name, code]) => ({ name, code }))
    .filter(s => !mySubjects.find(m => m.code === s.code))
    .filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.code.includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleRemove = async (s) => {
    const yes = await confirm({
      title: `Remove ${s.name}?`,
      message: 'This subject will be removed from your list. Your search history and favourites for it will not be affected.',
      confirmLabel: t('subjects.remove'),
      danger: true,
    });
    if (yes) removeSubject(level, s.code);
  };

  return (
    <div className="space-y-4">
      <ConfirmUI />
      {mySubjects.length === 0 ? (
        <div className="text-center py-12 bg-white/5 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-300 dark:border-[hsl(222,18%,24%)]">
          <BookOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3"/>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('general.noData')}</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Click "+ {t('subjects.add')}" to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {mySubjects.map(s => (
              <motion.div key={s.code} layout initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-[hsl(222,24%,12%)] border border-gray-200 dark:border-[hsl(222,18%,22%)] rounded-2xl hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentClass} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {s.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.code}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  {onSearchSubject && (
                    <Button size="icon" variant="ghost" onClick={() => onSearchSubject(s)}
                      className="h-8 w-8 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Search className="w-3.5 h-3.5"/>
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => handleRemove(s)}
                    className="h-8 w-8 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}
        className="gap-1.5 rounded-xl border-2 text-sm">
        {showAdd ? <ChevronUp className="w-3.5 h-3.5"/> : <Plus className="w-3.5 h-3.5"/>}
        {showAdd ? 'Close' : `+ ${t('subjects.add')}`}
      </Button>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            className="overflow-hidden">
            <div className="bg-gray-50 dark:bg-[hsl(222,24%,11%)] rounded-2xl p-4 border border-gray-200 dark:border-[hsl(222,18%,20%)]">
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder={t('general.searchHere')}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl bg-white dark:bg-[hsl(222,22%,13%)] text-gray-900 dark:text-gray-100 placeholder-gray-400 mb-3 focus:border-blue-500 focus:outline-none"/>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {available.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-3">{query ? 'No matches' : 'All subjects added'}</p>
                  : available.map(s => (
                    <button key={s.code} onClick={() => { addSubject(level, s); setQuery(''); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-[hsl(222,28%,16%)] text-left transition-colors group/add">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.name}</span>
                      <span className="text-xs text-gray-400 group-hover/add:text-blue-500">{s.code}</span>
                    </button>
                  ))
                }
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
