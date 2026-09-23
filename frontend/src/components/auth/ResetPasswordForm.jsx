import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { VALIDATION_RULES } from '../../utils/validation';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { Button } from '../common/Button';

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const passwordValue = watch('password');

  // If token is missing from URL
  if (!token) {
    return (
      <div className="flex flex-col items-center text-center py-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Invalid or Expired Link
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This password reset token is missing or has expired. Please request a new link.
        </p>
        <Link to="/forgot-password" className="w-full">
          <Button fullWidth size="md">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setApiError('');
    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setApiError(err.message || 'Failed to reset password. Link might be invalid.');
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center py-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Password Updated!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Your account password has been reset securely. Redirecting to sign in page...
        </p>
        <Link to="/login" className="w-full">
          <Button fullWidth size="md">
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 leading-relaxed">
        Please create a new password that is at least 8 characters long and contains letters, numbers, and special symbols.
      </p>

      {/* New Password */}
      <div>
        <PasswordInput
          label="New password"
          id="password"
          placeholder="Enter new password"
          required
          error={errors.password?.message}
          {...register('password', VALIDATION_RULES.password)}
        />
        <PasswordStrength password={passwordValue} />
      </div>

      {/* Confirm New Password */}
      <PasswordInput
        label="Confirm new password"
        id="confirmPassword"
        placeholder="Re-enter your new password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your new password.',
          validate: (val) => {
            if (watch('password') !== val) {
              return 'Passwords do not match.';
            }
          }
        })}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        size="md"
        rightIcon={<ArrowRight className="w-4 h-4" />}
        className="mt-2"
      >
        {isSubmitting ? 'Resetting password...' : 'Update password'}
      </Button>

      <div className="text-center mt-3">
        <Link
          to="/login"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Cancel and return to sign in
        </Link>
      </div>
    </form>
  );
}
