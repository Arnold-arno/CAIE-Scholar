/**
 * MySubjects.jsx
 * Shows the user's saved subjects for one level.
 * Subjects added via onboarding or the "+ Add subject" button appear here.
 * Clicking a subject triggers a search for its papers.
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';

export default function MySubjects({ level, subjectMap = {}, accentClass = 'from-blue-600 to-indigo-700', onSearchSubject }) {
  const { subjects, addSubject, removeSubject } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [query,   setQuery]   = useState('');

  const mySubjects = subjects[level] || [];

  // All subjects for this level not already added
  const available = Object.entries(subjectMap)
    .map(([name, code]) => ({ name, code }))
    .filter(s => !mySubjects.find(m => m.code === s.code))
    .filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.code.includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      {/* My subjects grid */}
      {mySubjects.length === 0 ? (
        <div className="text-center py-12 bg-white/60 rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No subjects added yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "+ Add subject" to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {mySubjects.map((s, i) => (
              <motion.div key={s.code}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.04 }}>
                <Card className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group">
                  <div className={`h-1 bg-gradient-to-r ${accentClass} rounded-t-xl`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{s.name}</p>
                        <Badge variant="outline" className="text-xs mt-1 text-gray-500">{s.code}</Badge>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button size="icon" variant="ghost"
                          onClick={() => onSearchSubject && onSearchSubject(s)}
                          className="h-7 w-7 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Search papers for this subject">
                          <Search className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost"
                          onClick={() => removeSubject(level, s.code)}
                          className="h-7 w-7 text-red-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove subject">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add subject panel */}
      <div>
        <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}
          className="border-dashed border-2 border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 gap-2">
          {showAdd ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAdd ? 'Hide' : '+ Add subject'}
        </Button>

        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <input
                  placeholder="Search subjects to add…"
                  value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {available.map(s => (
                    <button key={s.code}
                      onClick={() => { addSubject(level, s); setQuery(''); }}
                      className="flex items-center justify-between text-left px-3 py-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm group">
                      <span className="truncate text-gray-800 text-xs">{s.name}</span>
                      <span className="text-xs text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-1">
                        <Plus className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                  {available.length === 0 && (
                    <p className="col-span-2 text-center text-gray-400 text-sm py-4">
                      {query ? 'No subjects match' : 'All subjects already added'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
