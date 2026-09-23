import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-ring select-none';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm shadow-brand-500/20 disabled:bg-brand-400 dark:disabled:bg-brand-800/50',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm disabled:opacity-60',
    outline: 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 disabled:opacity-50',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm shadow-rose-500/20 disabled:bg-rose-400'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5'
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      whileTap={isDisabled ? {} : { scale: 0.985 }}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size={size === 'sm' ? 'sm' : 'md'} className="text-current" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
