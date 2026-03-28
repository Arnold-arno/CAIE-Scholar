/**
 * SearchableSubjectSelect.jsx
 *
 * Rich subject selector that:
 *  - Searches by subject name OR subject code
 *  - Displays the subject code next to each name
 *  - Shows a paper component picker when a subject has multiple papers
 *  - Exposes { subject, paper } so QuestionSearch can pass paper_number to the backend
 *
 * Props:
 *  subjects         — { [name]: { code, papers: { [label]: number } } }  OR  { [name]: string (code) }
 *  selectedSubject  — string
 *  onSelectSubject  — (name: string) => void
 *  selectedPaper    — string | null   (paper number e.g. "11")
 *  onSelectPaper    — (number: string | null) => void
 *  label            — string
 *  stepNumber       — string | number
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, ChevronDown, Layers, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableSubjectSelect({
  subjects = {},
  selectedSubject,
  onSelectSubject,
  selectedPaper,
  onSelectPaper,
  label = 'Subject',
  stepNumber = '1',
}) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const inputRef = useRef(null);

  // Normalise: subjects value can be string (legacy) or { code, papers }
  const getInfo = (name) => {
    const v = subjects[name];
    if (!v) return { code: '', papers: {} };
    if (typeof v === 'string') return { code: v, papers: {} };
    return { code: v.code || '', papers: v.papers || {} };
  };

  const sorted = useMemo(() => Object.keys(subjects).sort(), [subjects]);

  const filtered = useMemo(() => {
    if (!query) return sorted;
    const q = query.toLowerCase();
    return sorted.filter(name => {
      const { code } = getInfo(name);
      return name.toLowerCase().includes(q) || code.includes(q);
    });
  }, [sorted, query, subjects]);

  const selectedInfo = selectedSubject ? getInfo(selectedSubject) : null;
  const hasPapers    = selectedInfo && Object.keys(selectedInfo.papers).length > 1;

  const handleSelect = (name) => {
    onSelectSubject(name);
    onSelectPaper?.(null); // reset paper selection
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onSelectSubject('');
    onSelectPaper?.(null);
    setQuery('');
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!e.target.closest('[data-subject-select]')) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="space-y-2.5" data-subject-select>
      {/* Step label */}
      <Label className="text-base font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
        <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
          {stepNumber}
        </span>
        {label}
      </Label>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type subject name or code…"
          value={selectedSubject && !open ? selectedSubject : query}
          onChange={e => {
            setQuery(e.target.value);
            if (selectedSubject) { onSelectSubject(''); onSelectPaper?.(null); }
            setOpen(true);
          }}
          onFocus={() => { setOpen(true); if (selectedSubject) setQuery(''); }}
          className="w-full pl-10 pr-10 py-3 text-base border-2 border-gray-200 dark:border-[hsl(222,18%,26%)] rounded-xl bg-white dark:bg-[hsl(222,22%,13%)] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/40 focus:outline-none transition-all"
        />
        {selectedSubject ? (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-4 h-4"/>
          </button>
        ) : (
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform pointer-events-none ${open ? 'rotate-180' : ''}`}/>
        )}

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:4 }}
              transition={{ duration:0.12 }}
              className="absolute z-30 w-full mt-1.5 bg-white dark:bg-[hsl(222,24%,13%)] border-2 border-gray-200 dark:border-[hsl(222,18%,22%)] rounded-xl shadow-2xl max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No subjects found for "{query}"</div>
              ) : filtered.map(name => {
                const { code } = getInfo(name);
                const isSelected = name === selectedSubject;
                return (
                  <button key={name} onClick={() => handleSelect(name)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-[hsl(222,18%,18%)] last:border-0 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/25'
                        : 'hover:bg-blue-50/60 dark:hover:bg-[hsl(222,28%,16%)]'
                    }`}>
                    <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 text-left">{name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                        {code}
                      </span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-blue-500"/>}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected subject confirmation + paper picker */}
      <AnimatePresence>
        {selectedSubject && selectedInfo && (
          <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* Confirmation badge */}
            <div className="flex items-center gap-2.5 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800/60 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-800 dark:text-green-300 truncate">{selectedSubject}</p>
                <p className="text-xs text-green-600 dark:text-green-500 font-mono">Code: {selectedInfo.code}</p>
              </div>
            </div>

            {/* Paper component picker — only when subject has multiple papers */}
            {hasPapers && (
              <div className="mt-2.5">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5"/>
                  Filter by paper component <span className="font-normal">(optional — leave blank to search all)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {/* All papers pill */}
                  <button
                    onClick={() => onSelectPaper?.(null)}
                    className={`text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all ${
                      !selectedPaper
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-gray-200 dark:border-[hsl(222,18%,24%)] text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600'
                    }`}>
                    All papers
                  </button>
                  {Object.entries(selectedInfo.papers).map(([paperLabel, paperNum]) => (
                    <button key={paperNum}
                      onClick={() => onSelectPaper?.(selectedPaper === paperNum ? null : paperNum)}
                      className={`text-xs px-3 py-1.5 rounded-full border-2 font-semibold transition-all ${
                        selectedPaper === paperNum
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'border-gray-200 dark:border-[hsl(222,18%,24%)] text-gray-600 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}>
                      <span className="font-mono font-bold mr-1">{paperNum}</span>
                      <span>{paperLabel.replace(/^Paper \d+ ?—? ?/i, '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
