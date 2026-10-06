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
  Compass, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';
import { useAuth, useTheme } from '../hooks';
import { VALIDATION_RULES } from '../utils/validation';
import { Input, PasswordInput, Button } from '../components/common';

export default function Login() {
  const { login, loginAsReader } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [activeTab, setActiveTab] = useState('reader'); // 'reader' | 'staff'
  const [isReaderLoading, setIsReaderLoading] = useState(false);

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

  const handleReaderAccess = async () => {
    setIsReaderLoading(true);
    setApiError('');
    try {
      await loginAsReader();
      navigate('/dashboard');
    } catch (err) {
      setApiError('ಓದುಗರ ಪ್ರವೇಶ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.');
    } finally {
      setIsReaderLoading(false);
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
              ಕನ್ನಡ ಕಥಾ ಕೋಶ
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Kannada Story Archive
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-stone-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-900 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Center Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-kannada text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ಸ್ವಾಗತ (Welcome)
            </h1>
            <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              ಕನ್ನಡ ಕಥೆಗಳು ಹಾಗೂ ಸಾಹಿತಿಗಳ ಮುಕ್ತ ಡಿಜಿಟಲ್ ಭಂಡಾರ
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-slate-800/80 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('reader')}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'reader'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>ಓದುಗರು (Reader)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>ಸಂಪಾದಕರು (Staff)</span>
            </button>
          </div>

          {/* Error Message */}
          {apiError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Tab 1: Reader / Public Login */}
          {activeTab === 'reader' && (
            <div className="flex flex-col gap-4 text-center">
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-slate-800/40 border border-amber-200/60 dark:border-slate-800 text-left">
                <h3 className="font-kannada font-bold text-sm text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <span>📖 ಸಾರ್ವಜನಿಕ ಉಚಿತ ಪ್ರವೇಶ</span>
                </h3>
                <p className="font-kannada text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  ಕುವೆಂಪು, ಬೇಂದ್ರೆ, ತೇಜಸ್ವಿ ಮೊದಲಾದ ಮಹಾನ್ ಸಾಹಿತಿಗಳ ಕಥೆಗಳನ್ನು ಓದಲು ಯಾವುದೇ ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿಲ್ಲ.
                </p>
              </div>

              <Button
                type="button"
                fullWidth
                size="lg"
                isLoading={isReaderLoading}
                onClick={handleReaderAccess}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-primary-600 hover:bg-primary-700 text-white font-kannada font-semibold text-sm shadow-sm"
              >
                {isReaderLoading ? 'ತೆರೆಯಲಾಗುತ್ತಿದೆ...' : 'ಕಥೆಗಳನ್ನು ಓದಲು ಪ್ರಾರಂಭಿಸಿ (Start Reading)'}
              </Button>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                ಕಥೆಗಳನ್ನು ಓದಲು, ಹುಡುಕಲು ಮತ್ತು ಸಾಹಿತಿಗಳ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಲು ತಕ್ಷಣ ಪ್ರವೇಶಿಸಿ.
              </p>
            </div>
          )}

          {/* Tab 2: Staff / Admin Login */}
          {activeTab === 'staff' && (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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

              <PasswordInput
                label="ಪಾಸ್‌ವರ್ಡ್ (Password)"
                id="password"
                placeholder="ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ"
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
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium"
              >
                {isSubmitting ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'ಖಾತೆಗೆ ಲಾಗಿನ್ (Sign In)'}
              </Button>

              {/* Quick Fill Options for Testing */}
              <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>ತ್ವರಿತ ಆಯ್ಕೆ:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => quickFill('admin@example.com', 'Admin@12345')}
                    className="text-primary-600 dark:text-amber-400 font-semibold hover:underline"
                  >
                    Admin
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <button
                    type="button"
                    onClick={() => quickFill('reader@example.com', 'Reader@12345')}
                    className="text-primary-600 dark:text-amber-400 font-semibold hover:underline"
                  >
                    Reader
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Clean Footer */}
      <div className="w-full max-w-md mx-auto text-center text-xs text-slate-400 dark:text-slate-500 py-2">
        <span className="font-kannada">ಕನ್ನಡ ಕಥಾ ಕೋಶ</span> &bull; <span>ಸರಳ & ಸುಲಭ ಸಾಹಿತ್ಯ ವೇದಿಕೆ</span>
      </div>
    </div>
  );
}
