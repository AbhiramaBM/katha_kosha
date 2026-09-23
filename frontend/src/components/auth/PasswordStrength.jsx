import React from 'react';
import { Check, X } from 'lucide-react';
import { calculatePasswordStrength } from '../../utils/validation';

export function PasswordStrength({ password = '' }) {
  if (!password) return null;

  const { score, label, color, textColor, checks } = calculatePasswordStrength(password);

  const criteria = [
    { label: 'At least 8 characters', met: checks.length },
    { label: 'Uppercase & lowercase letters', met: checks.lower && checks.upper },
    { label: 'At least one number (0-9)', met: checks.number },
    { label: 'At least one special character (!@#$)', met: checks.special }
  ];

  return (
    <div className="flex flex-col gap-2 mt-1.5 animate-fade-in">
      {/* 4-Segment Strength Bar */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              score >= level ? color : 'bg-slate-200 dark:bg-slate-700/60'
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-[11px]">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 ${
              item.met
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {item.met ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
