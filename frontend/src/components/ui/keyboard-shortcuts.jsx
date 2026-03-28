/**
 * keyboard-shortcuts.jsx
 * Press ? anywhere to open the keyboard shortcuts overlay.
 * Also shows a subtle ? hint button in the navbar.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';

const GROUPS = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'],     action: 'Open command palette'       },
      { keys: ['?'],           action: 'Show keyboard shortcuts'     },
      { keys: ['Esc'],         action: 'Close any open panel'        },
      { keys: ['G', 'H'],      action: 'Go to Home'                  },
      { keys: ['G', 'I'],      action: 'Go to IGCSE Study Hub'       },
      { keys: ['G', 'A'],      action: 'Go to AS & A-Level Hub'      },
      { keys: ['G', 'O'],      action: 'Go to O-Level Hub'           },
    ],
  },
  {
    title: 'Search',
    shortcuts: [
      { keys: ['/'],           action: 'Focus search / topic field'  },
      { keys: ['Enter'],       action: 'Run search'                  },
      { keys: ['U'],           action: 'Switch to upload mode'       },
      { keys: ['S'],           action: 'Switch to search mode'       },
    ],
  },
  {
    title: 'AI Notes',
    shortcuts: [
      { keys: ['⌘', 'Enter'],  action: 'Generate notes'              },
      { keys: ['F'],           action: 'Open flashcard mode'         },
      { keys: ['←', '→'],      action: 'Navigate flashcards'         },
      { keys: ['Space'],       action: 'Flip flashcard'              },
      { keys: ['H'],           action: 'Toggle notes history'        },
    ],
  },
  {
    title: 'Read Aloud',
    shortcuts: [
      { keys: ['R'],           action: 'Read selected text aloud'    },
      { keys: ['P'],           action: 'Pause / resume reading'      },
    ],
  },
];

function Key({ k }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 text-xs font-bold
      bg-white dark:bg-[hsl(222,22%,18%)] text-gray-700 dark:text-gray-300
      border border-gray-300 dark:border-[hsl(222,18%,28%)] rounded-md shadow-sm
      font-mono leading-none">
      {k}
    </kbd>
  );
}

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const isInput = ['INPUT','TEXTAREA','SELECT'].includes(tag);
      if (isInput) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setOpen(o => !o); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {/* Trigger hint */}
      <button
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg
          text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400
          hover:bg-gray-100 dark:hover:bg-[hsl(222,22%,16%)] transition-colors text-sm font-bold"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto
                bg-white dark:bg-[hsl(222,24%,11%)]
                rounded-2xl shadow-2xl border border-gray-200 dark:border-[hsl(222,18%,22%)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[hsl(222,18%,18%)]">
                <div className="flex items-center gap-2">
                  <Command className="w-4 h-4 text-blue-500" />
                  <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base">Keyboard shortcuts</h2>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-[hsl(222,22%,16%)] text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Groups */}
              <div className="p-6 grid sm:grid-cols-2 gap-6">
                {GROUPS.map(group => (
                  <div key={group.title}>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                      {group.title}
                    </p>
                    <div className="space-y-2.5">
                      {group.shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{s.action}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {s.keys.map((k, j) => (
                              <React.Fragment key={j}>
                                {j > 0 && s.keys.length > 1 && !['←','→'].includes(s.keys[j-1]) && (
                                  <span className="text-gray-300 dark:text-gray-600 text-xs">+</span>
                                )}
                                <Key k={k} />
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-3 border-t border-gray-100 dark:border-[hsl(222,18%,18%)] text-xs text-gray-400 text-center">
                Press <Key k="?" /> anywhere to toggle this panel · <Key k="Esc" /> to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
