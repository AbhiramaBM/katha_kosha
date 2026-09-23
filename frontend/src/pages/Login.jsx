import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, BookOpen, Key, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { VALIDATION_RULES } from '../utils/validation';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/auth/PasswordInput';
import { Button } from '../components/common/Button';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@12345'
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.');
    }
  };

  const autofillAccount = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setApiError('');
  };

  return (
    <div className="min-h-screen w-full flex bg-brand-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-gold-500 selection:text-white">
      {/* Left Literary Editorial Hero Banner */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 bg-primary-600 text-white overflow-hidden">
        {/* Archival ambient gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gold-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-gold-400 shadow-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="font-kannada text-xl font-bold tracking-tight block">ಕನ್ನಡ ಕಥಾ ಕೋಶ</span>
            <span className="text-[10px] font-semibold text-gold-400 uppercase tracking-widest">
              Digital Archival Repository
            </span>
          </div>
        </div>

        {/* Center Presentation */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-gold-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-kannada">ಸಂಪಾದಕೀಯ & ಆಡಳಿತ ವೇದಿಕೆ</span>
          </div>

          <h1 className="font-kannada text-3xl xl:text-4xl font-extrabold leading-tight text-white mb-4">
            ಕನ್ನಡ ಸಾಹಿತ್ಯ ಲೋಕದ ಅಮೂಲ್ಯ ಕಥಾಸಂಪತ್ತಿನ ಡಿಜಿಟಲ್ ಸಂರಕ್ಷಣೆ.
          </h1>

          <p className="font-kannada text-slate-200 text-sm xl:text-base leading-relaxed mb-8">
            ಕುವೆಂಪು, ತೇಜಸ್ವಿ, ಮಾಸ್ತಿ, ಬೇಂದ್ರೆ ಮೊದಲಾದ ಮೇರು ಸಾಹಿತಿಗಳ ಕಥೆಗಳು, ತಾಳೆಗರಿ ಹಸ್ತಪ್ರತಿಗಳು ಹಾಗೂ ಸಾಹಿತ್ಯಿಕ ವಿಮರ್ಶೆಗಳ ಅಧಿಕೃತ ದಾಖಲೀಕರಣ ವೇದಿಕೆ.
          </p>

          {/* Seed accounts quick pill */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs">
            <div className="font-semibold text-gold-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>ಪರೀಕ್ಷಾರ್ಥ ಖಾತೆಗಳು (Ready Seed Accounts):</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => autofillAccount('admin@example.com', 'Admin@12345')}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-mono text-[11px] transition-colors"
              >
                Admin: admin@example.com
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-300 border-t border-white/15 pt-6 flex items-center justify-between">
          <span className="font-kannada">ಕನ್ನಡ ಸಾಹಿತ್ಯ ಪರಿಷತ್ತು & ಕಥಾ ಕೋಶ</span>
          <span className="text-[11px]">v1.0 LTS &bull; UTF-8 Unicode</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 md:p-14">
        {/* Top bar with Theme Switcher */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-gold-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-kannada font-bold text-lg text-primary-600 dark:text-white">
              ಕನ್ನಡ ಕಥಾ ಕೋಶ
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="mb-8">
            <h2 className="font-kannada text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              ಲಾಗಿನ್ / Sign In
            </h2>
            <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              ಕಥಾ ಕೋಶದ ಆಡಳಿತ ಅಥವಾ ಸಂಪಾದಕೀಯ ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಿ.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-xl shadow-stone-200/50 dark:shadow-none">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              {apiError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Email */}
              <Input
                label="ಇಮೇಲ್ ವಿಳಾಸ (Email)"
                id="email"
                type="email"
                placeholder="admin@example.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email', VALIDATION_RULES.email)}
              />

              {/* Password */}
              <PasswordInput
                label="ಪಾಸ್‌ವರ್ಡ್ (Password)"
                id="password"
                placeholder="ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ"
                required
                error={errors.password?.message}
                {...register('password', VALIDATION_RULES.password)}
              />

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2 bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isSubmitting ? 'ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ...' : 'ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಿ (Sign In)'}
              </Button>

              {/* Fast autofill for dev testing */}
              <div className="pt-4 border-t border-stone-100 dark:border-slate-800/80 text-center">
                <span className="text-[11px] text-slate-400 block mb-2">ತ್ವರಿತ ಡೆಮೋ ಲಾಗಿನ್ (Quick Fill):</span>
                <button
                  type="button"
                  onClick={() => autofillAccount('admin@example.com', 'Admin@12345')}
                  className="text-xs font-semibold text-primary-600 dark:text-gold-400 hover:underline"
                >
                  Admin (admin@example.com)
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-4 font-kannada">
          ಕನ್ನಡ ಕಥಾ ಕೋಶ &bull; ಸುರಕ್ಷಿತ JWT ದೃಢೀಕರಣ ವ್ಯವಸ್ಥೆ
        </div>
      </div>
    </div>
  );
}
