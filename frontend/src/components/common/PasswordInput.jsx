import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from './Input';

export const PasswordInput = forwardRef(function PasswordInput(
  {
    label = 'Password',
    id = 'password',
    error,
    helperText,
    required = false,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      ref={ref}
      id={id}
      type={showPassword ? 'text' : 'password'}
      label={label}
      required={required}
      error={error}
      helperText={helperText}
      leftIcon={<Lock className="w-4 h-4" />}
      rightSlot={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none p-1 rounded transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
      {...props}
    />
  );
});
