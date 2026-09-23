import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function AuthLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
          <span>Checking authentication...</span>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
          Verifying security tokens and restoring your session.
        </p>
      </motion.div>
    </div>
  );
}
