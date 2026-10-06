import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Sun, 
  Moon, 
  Lock,
  Info
} from 'lucide-react';
import { useAuth, useTheme, useLanguage } from '../hooks';
import { VALIDATION_RULES } from '../utils/validation';
import { Input, PasswordInput, Button, LanguageToggle } from '../components/common';

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, t } = useLanguage();
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
      setApiError(
        err.message || 
        (lang === 'kn' 
          ? 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.' 
          : 'Sign in failed. Please verify your credentials.')
      );
    }
  };

  const quickFill = (email, password) => {
    setValue('email', email);
    setValue('password', password);
    setApiError('');
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="font-kannada font-bold text-base text-slate-900 dark:text-white leading-none block">
              {t('appName')}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('appSubtitle')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-xl border border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-900 transition-colors"
            aria-label={t('toggleTheme')}
            title={t('toggleTheme')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Center Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-kannada text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t('loginWelcome')}
            </h1>
            <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Access Policy Info Box */}
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/70 dark:border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="font-kannada text-[11px] sm:text-xs leading-relaxed">
              {lang === 'kn' 
                ? 'ಓದುಗರು ಹಾಗೂ ಸಂಪಾದಕರ ಖಾತೆಗಳನ್ನು ಮುಖ್ಯ ಆಡಳಿತಗಾರರು (Admin) ರಚಿಸುತ್ತಾರೆ. ಪ್ರವೇಶ ಪಡೆಯಲು ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಬಳಸಿ.'
                : 'Reader and Editor accounts are created by the Admin. Please sign in with your registered email and password.'}
            </p>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input
              label={lang === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ (Email)' : 'Email Address'}
              id="email"
              type="email"
              placeholder="user@example.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email', VALIDATION_RULES.email)}
            />

            <PasswordInput
              label={lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ (Password)' : 'Password'}
              id="password"
              placeholder={lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ' : 'Enter password'}
              required
              error={errors.password?.message}
              {...register('password', VALIDATION_RULES.password)}
            />

            <Button
              type="submit"
              fullWidth
              size="md"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-1 bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-xs"
            >
              {isSubmitting 
                ? t('verifying') 
                : (lang === 'kn' ? 'ಖಾತೆಗೆ ಲಾಗಿನ್' : 'Sign In')}
            </Button>

            {/* Quick Fill Options for Testing */}
            <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>{lang === 'kn' ? 'ತ್ವರಿತ ಆಯ್ಕೆ:' : 'Quick Select:'}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => quickFill('admin@example.com', 'Admin@12345')}
                  className="text-primary-600 dark:text-amber-400 font-semibold hover:underline"
                  title="Admin (ಮುಖ್ಯ ಆಡಳಿತಗಾರ)"
                >
                  Admin
                </button>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <button
                  type="button"
                  onClick={() => quickFill('editor@example.com', 'Editor@12345')}
                  className="text-primary-600 dark:text-amber-400 font-semibold hover:underline"
                  title="Editor (ಸಂಪಾದಕರು)"
                >
                  Editor
                </button>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <button
                  type="button"
                  onClick={() => quickFill('reader@example.com', 'Reader@12345')}
                  className="text-primary-600 dark:text-amber-400 font-semibold hover:underline"
                  title="Reader (ಓದುಗರು)"
                >
                  Reader
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>

      {/* Clean Footer */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 dark:text-slate-500 py-2">
        <span className="font-kannada">{t('appName')}</span> &bull; <span>{t('appSubtitle')}</span>
      </div>
    </div>
  );
}
