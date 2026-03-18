import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle } from 'lucide-react';

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
      <Label className="text-sm font-semibold flex items-center gap-2">
        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
          {stepNumber}
        </span>
        {label}
      </Label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Type to search subjects…"
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedSubject) onSelectSubject('');
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-9 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        />

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 w-full mt-1.5 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
              {filtered.length === 0
                ? <div className="p-4 text-center text-sm text-gray-400">No subjects found</div>
                : filtered.map(subject => (
                    <div key={subject}
                      onClick={() => handleSelect(subject)}
                      className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                      <div className="font-medium text-sm text-gray-900">{subject}</div>
                      <div className="text-xs text-gray-400">Code: {getCode(subject)}</div>
                    </div>
                  ))
              }
            </div>
          </>
        )}
      </div>

      {selectedSubject && subjects[selectedSubject] && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2.5 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">{selectedSubject}</p>
            <p className="text-xs text-green-600">Code: {getCode(selectedSubject)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
