import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { VALIDATION_RULES } from '../../utils/validation';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err) {
      setApiError(err.message || 'Unable to process your request.');
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center py-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Check your email
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          We have sent a password reset link to{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedEmail}</span>.
          Follow the instructions in the email to choose a new password.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link to="/reset-password?token=test-token" className="w-full">
            <Button variant="outline" fullWidth size="md">
              Simulate Clicking Reset Link
            </Button>
          </Link>

          <Link to="/login" className="w-full">
            <Button variant="ghost" fullWidth size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Login
            </Button>
          </Link>
        </div>
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
        Enter the email address associated with your account and we will send you a verification link to reset your password.
      </p>

      {/* Email */}
      <Input
        label="Account email"
        id="email"
        type="email"
        placeholder="name@company.com"
        required
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email', VALIDATION_RULES.email)}
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
        {isSubmitting ? 'Sending reset link...' : 'Send password reset link'}
      </Button>

      {/* Back to Login */}
      <div className="text-center mt-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </form>
  );
}
