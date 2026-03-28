/**
 * page-progress.jsx — Thin top-of-page loading bar that fires on route changes.
 * No external dependency needed — pure framer-motion.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function PageProgress() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(0);
    // Animate to 80% quickly, then pause
    const t1 = setTimeout(() => setProgress(80), 80);
    // Complete and hide
    const t2 = setTimeout(() => setProgress(100), 350);
    const t3 = setTimeout(() => setVisible(false), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[999] h-[2.5px] pointer-events-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 shadow-sm shadow-blue-400/50"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
