import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function SocialLogin({ onSocialSuccess }) {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const toast = useToast();

  const handleSocialClick = (provider) => {
    setLoadingProvider(provider);
    setTimeout(() => {
      setLoadingProvider(null);
      toast.info(`${provider} authentication flow simulated.`);
      if (onSocialSuccess) {
        onSocialSuccess(provider);
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-400 font-medium absolute">
          Or continue with
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        {/* Google Login */}
        <button
          type="button"
          disabled={!!loadingProvider}
          onClick={() => handleSocialClick('Google')}
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all duration-150 focus-ring disabled:opacity-60"
        >
          {loadingProvider === 'Google' ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.44 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.56 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* GitHub Login */}
        <button
          type="button"
          disabled={!!loadingProvider}
          onClick={() => handleSocialClick('GitHub')}
          className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all duration-150 focus-ring disabled:opacity-60"
        >
          {loadingProvider === 'GitHub' ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-4 h-4 shrink-0 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          )}
          <span>GitHub</span>
        </button>
      </div>
    </div>
  );
}
