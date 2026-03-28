/**
 * confirm-dialog.jsx
 *
 * A lightweight, animated confirmation dialog.
 *
 * Usage (hook):
 *   const { confirm, ConfirmUI } = useConfirm();
 *   // In JSX: <ConfirmUI />
 *   // To trigger: const yes = await confirm({ title, message, confirmLabel?, danger? })
 *
 * Returns a Promise<boolean>. Awaits user choice.
 */
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Check } from 'lucide-react';

export function useConfirm() {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback(({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = true }) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ title, message, confirmLabel, cancelLabel, danger });
    });
  }, []);

  const handleChoice = useCallback((yes) => {
    setDialog(null);
    resolveRef.current?.(yes);
  }, []);

  const ConfirmUI = () => (
    <AnimatePresence>
      {dialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => handleChoice(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="w-full max-w-sm bg-white dark:bg-[hsl(222,24%,12%)] rounded-2xl shadow-2xl border border-gray-200 dark:border-[hsl(222,18%,22%)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon header */}
            <div className={`px-6 pt-6 pb-4 flex items-start gap-4`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                dialog.danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {dialog.danger
                  ? <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400"/>
                  : <Check className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">
                  {dialog.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  {dialog.message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => handleChoice(false)}
                className="flex-1 h-10 rounded-xl border-2 border-gray-200 dark:border-[hsl(222,18%,24%)] text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[hsl(222,22%,16%)] transition-colors"
              >
                {dialog.cancelLabel}
              </button>
              <button
                onClick={() => handleChoice(true)}
                className={`flex-1 h-10 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-1.5 ${
                  dialog.danger
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {dialog.danger && <Trash2 className="w-3.5 h-3.5"/>}
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
