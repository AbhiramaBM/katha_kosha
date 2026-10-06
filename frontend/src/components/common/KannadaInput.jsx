import React, { useState, useRef } from 'react';
import { transliterateKannada } from '../../utils/kannadaTransliteration';
import { Languages, HelpCircle } from 'lucide-react';

export function KannadaInput({
  label,
  id,
  value = '',
  onChange,
  placeholder = '',
  required = false,
  multiline = false,
  rows = 4,
  error = '',
  helperText = '',
  defaultKannada = true,
  className = ''
}) {
  const [isKannada, setIsKannada] = useState(defaultKannada);
  const [showHelper, setShowHelper] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    if (onChange) {
      onChange(rawVal);
    }
  };

  const insertCharacter = (char) => {
    const el = inputRef.current;
    if (!el) {
      if (onChange) onChange((value || '') + char);
      return;
    }

    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentText = value || '';
    const updated = currentText.substring(0, start) + char + currentText.substring(end);
    if (onChange) onChange(updated);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    }, 0);
  };

  // Quick characters palette
  const quickChars = ['ಂ', 'ಃ', '್', 'ಾ', 'ಿ', 'ೀ', 'ು', 'ೂ', 'ೃ', 'ೆ', 'ೇ', 'ೈ', 'ೊ', 'ೋ', 'ೌ', 'ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಚ', 'ಜ', 'ಟ', 'ಡ', 'ಣ', 'ತ', 'ದ', 'ನ', 'ಪ', 'ಬ', 'ಮ', 'ಯ', 'ರ', 'ಲ', 'ವ', 'ಶ', 'ಷ', 'ಸ', 'ಹ', 'ಳ'];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label and Switch Toggle */}
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        {/* Kannada / English phonetic switch toggle */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => setIsKannada(!isKannada)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
              isKannada
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs'
                : 'bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700'
            }`}
            title="ಕನ್ನಡ ಫೋನೆಟಿಕ್ ಟೈಪಿಂಗ್ ಬದಲಾಯಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ (Toggle Kannada Phonetic)"
          >
            <Languages className="w-3 h-3" />
            <span>{isKannada ? 'ಕನ್ನಡ (Phonetic ON)' : 'English (OFF)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="ಕನ್ನಡ ಅಕ್ಷರಗಳ ಸಹಾಯ (Kannada character palette)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input or Textarea */}
      {multiline ? (
        <textarea
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          placeholder={isKannada ? (placeholder || 'ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ka -> ಕ, namaskara -> ನಮಸ್ಕಾರ)...') : placeholder}
          rows={rows}
          required={required}
          className={`w-full px-3.5 py-2.5 rounded-xl border ${
            error ? 'border-rose-400' : 'border-stone-200 dark:border-slate-700'
          } bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-kannada leading-relaxed`}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={value}
          onChange={handleInputChange}
          placeholder={isKannada ? (placeholder || 'ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ka -> ಕ, katha -> ಕಥಾ)...') : placeholder}
          required={required}
          className={`w-full px-3.5 py-2 rounded-xl border ${
            error ? 'border-rose-400' : 'border-stone-200 dark:border-slate-700'
          } bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-kannada`}
        />
      )}

      {/* Quick Helper Palette (Toggleable) */}
      {showHelper && (
        <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700 text-xs flex flex-col gap-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>💡 ಸುಲಭ ಟೈಪಿಂಗ್ ಸಲಹೆ: <strong>ka</strong> = ಕ, <strong>kaa</strong> = ಕಾ, <strong>ki</strong> = ಕಿ, <strong>bendre</strong> = ಬೇಂದ್ರೆ</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {quickChars.map((ch, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertCharacter(ch)}
                className="w-6 h-6 rounded bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 font-kannada text-xs font-semibold hover:bg-primary-50 dark:hover:bg-slate-600 hover:text-primary-600 transition-colors flex items-center justify-center"
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <span className="text-[11px] text-rose-500 font-medium">{error}</span>}
      {helperText && !error && <span className="text-[11px] text-slate-400">{helperText}</span>}
    </div>
  );
}
