/**
 * confirm-dialog.jsx — Reusable confirmation dialog.
 *
 * Usage:
 *   const { confirm, ConfirmUI } = useConfirm();
 *   // In JSX: <ConfirmUI />
 *   // To trigger:
 *   const yes = await confirm({
 *     title: 'Delete this?',
 *     message: 'This cannot be undone.',
 *     confirmLabel: 'Delete',   // default 'Confirm'
 *     cancelLabel:  'Keep it',  // default 'Cancel'
 *     danger: true,             // default true  → red confirm button
 *     icon: 'trash',            // 'trash' | 'warn' | 'info' | 'signout'
 *   });
 *
 * Returns Promise<boolean>.
 */
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, CheckCircle, LogOut, Info } from 'lucide-react';

export function useConfirm() {
  const [dialog, setDialog]   = useState(null);
  const resolveRef            = useRef(null);

  const confirm = useCallback(({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel  = 'Cancel',
    danger       = true,
    icon         = danger ? 'trash' : 'info',
  }) => new Promise(resolve => {
    resolveRef.current = resolve;
    setDialog({ title, message, confirmLabel, cancelLabel, danger, icon });
  }), []);

  const handleChoice = useCallback(yes => {
    setDialog(null);
    resolveRef.current?.(yes);
  }, []);

  const ICON_MAP = {
    trash:   { Icon: Trash2,        ring: 'bg-red-100   dark:bg-red-900/30',   text: 'text-red-600   dark:text-red-400'   },
    warn:    { Icon: AlertTriangle, ring: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    info:    { Icon: Info,          ring: 'bg-blue-100  dark:bg-blue-900/30',  text: 'text-blue-600  dark:text-blue-400'  },
    signout: { Icon: LogOut,        ring: 'bg-gray-100  dark:bg-gray-800/40',  text: 'text-gray-600  dark:text-gray-400'  },
  };

  const ConfirmUI = () => (
    <AnimatePresence>
      {dialog && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center sm:p-4 bg-black/65 backdrop-blur-sm"
          onClick={() => handleChoice(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            exit={{    opacity: 0, y: 40, scale: 0.96  }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="w-full sm:max-w-sm bg-white dark:bg-[hsl(222,24%,12%)] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-[hsl(222,18%,22%)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-9 h-1 rounded-full bg-gray-300 dark:bg-gray-600"/>
            </div>

            <div className="px-6 pt-5 pb-3 flex items-start gap-4">
              {(() => {
                const cfg = ICON_MAP[dialog.icon] || ICON_MAP.warn;
                return (
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.ring}`}>
                    <cfg.Icon className={`w-5 h-5 ${cfg.text}`}/>
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-snug">{dialog.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{dialog.message}</p>
              </div>
              <button onClick={() => handleChoice(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 mt-0.5">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="px-6 pb-6 pt-1 flex gap-3">
              <button onClick={() => handleChoice(false)}
                className="flex-1 h-11 rounded-xl border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] text-gray-600 dark:text-gray-400 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[hsl(222,22%,16%)] transition-colors">
                {dialog.cancelLabel}
              </button>
              <button onClick={() => handleChoice(true)}
                className={`flex-1 h-11 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                  dialog.danger ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
                }`}>
                {dialog.icon === 'trash' && <Trash2 className="w-3.5 h-3.5"/>}
                {dialog.confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { confirm, ConfirmUI };
}
