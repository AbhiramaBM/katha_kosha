import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    error,
    helperText,
    leftIcon = null,
    rightSlot = null,
    required = false,
    className = '',
    inputClassName = '',
    disabled = false,
    ...props
  },
  ref
) {
  const inputId = id || props.name || Math.random().toString(36).substring(7);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            w-full rounded-xl border bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-sm
            transition-all duration-150 focus-ring
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${rightSlot ? 'pr-11' : 'pr-3.5'}
            py-2.5
            ${
              error
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 text-rose-900 dark:text-rose-100'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
            }
            ${disabled ? 'opacity-60 bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {rightSlot && (
          <div className="absolute right-3 flex items-center text-slate-400">
            {rightSlot}
          </div>
        )}
      </div>

      {error && (
        <div
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-rose-500 mt-0.5 animate-fade-in font-medium"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});
