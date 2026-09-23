import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const TOAST_ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
};

const TOAST_BORDER = {
  success: 'border-emerald-200 dark:border-emerald-800/40',
  error: 'border-rose-200 dark:border-rose-800/40',
  warning: 'border-amber-200 dark:border-amber-800/40',
  info: 'border-blue-200 dark:border-blue-800/40'
};

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`flex items-start gap-3 p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/40 min-w-[320px] max-w-md ${TOAST_BORDER[toast.type] || TOAST_BORDER.info}`}
      role="alert"
    >
      {TOAST_ICONS[toast.type] || TOAST_ICONS.info}
      <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
        {toast.message}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      <div className="flex flex-col gap-2.5 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
