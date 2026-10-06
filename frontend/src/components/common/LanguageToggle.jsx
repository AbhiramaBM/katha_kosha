import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageToggle({ className = '', compact = false }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg border border-stone-200 dark:border-slate-800 bg-stone-100/90 dark:bg-slate-800/80 transition-all ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLang('kn')}
        className={`px-2 py-1 rounded-md text-[11px] font-medium leading-none transition-all duration-150 select-none ${
          lang === 'kn'
            ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-amber-400 font-bold shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        aria-pressed={lang === 'kn'}
        title="ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ (Switch to Kannada)"
      >
        ಕನ್ನಡ
      </button>

      <span className="text-stone-300 dark:text-slate-700 px-0.5 select-none text-[10px] leading-none">|</span>

      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded-md text-[11px] font-medium leading-none transition-all duration-150 select-none ${
          lang === 'en'
            ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-amber-400 font-bold shadow-xs'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
        aria-pressed={lang === 'en'}
        title="Switch to English"
      >
        English
      </button>
    </div>
  );
}

export default LanguageToggle;
