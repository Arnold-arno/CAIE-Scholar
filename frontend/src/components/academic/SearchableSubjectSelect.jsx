import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, ChevronDown } from 'lucide-react';

export default function SearchableSubjectSelect({
  subjects = {},
  selectedSubject,
  onSelectSubject,
  label = 'Select Subject',
  stepNumber = '1',
}) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);

  const getCode = (key) => {
    const v = subjects[key];
    return typeof v === 'string' ? v : (v?.code || '');
  };

  const filtered = useMemo(() => {
    const keys = Object.keys(subjects).sort();
    if (!query) return keys;
    const q = query.toLowerCase();
    return keys.filter(k => k.toLowerCase().includes(q) || getCode(k).includes(q));
  }, [subjects, query]);

  const handleSelect = (subject) => {
    onSelectSubject(subject);
    setQuery('');
    setOpen(false);
  };

  const displayValue = selectedSubject || query;

  return (
    <div className="space-y-2">
      <Label className="text-base font-bold flex items-center gap-2 text-gray-800 dark:text-gray-200">
        <span className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">
          {stepNumber}
        </span>
        {label}
      </Label>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
        <input
          type="text"
          placeholder="Type to search subjects…"
          value={displayValue}
          onChange={(e) => { setQuery(e.target.value); if (selectedSubject) onSelectSubject(''); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="w-full pl-10 pr-10 py-3 text-base border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] rounded-xl bg-white dark:bg-[hsl(222,22%,13%)] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
        />
        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}/>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
            <div className="absolute z-20 w-full mt-1.5 bg-white dark:bg-[hsl(222,24%,13%)] border-2 border-gray-200 dark:border-[hsl(222,18%,22%)] rounded-xl shadow-2xl max-h-64 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">No subjects found for "{query}"</div>
              ) : (
                filtered.map(subject => (
                  <div key={subject} onClick={() => handleSelect(subject)}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-[hsl(222,18%,18%)] last:border-0 transition-colors hover:bg-blue-50 dark:hover:bg-[hsl(222,28%,17%)] ${selectedSubject === subject ? 'bg-blue-50 dark:bg-[hsl(222,28%,16%)]' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{subject}</span>
                      {selectedSubject === subject && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0"/>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Code: {getCode(subject)}</div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {selectedSubject && subjects[selectedSubject] && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800/50 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"/>
          <div>
            <p className="text-sm font-bold text-green-800 dark:text-green-300">{selectedSubject}</p>
            <p className="text-xs text-green-600 dark:text-green-500">Code: {getCode(selectedSubject)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
