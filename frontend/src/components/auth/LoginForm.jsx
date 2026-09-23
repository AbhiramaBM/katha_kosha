import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { VALIDATION_RULES } from '../../utils/validation';
import { Input } from '../common/Input';
import { PasswordInput } from './PasswordInput';
import { Button } from '../common/Button';
import { SocialLogin } from './SocialLogin';

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@12345',
      rememberMe: true
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      await login(data.email, data.password, data.rememberMe);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleSocialSuccess = async () => {
    try {
      await login('demo@example.com', 'Password@123');
      navigate('/dashboard');
    } catch (err) {
      setApiError('Social login failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {/* API Level Error Banner */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Email Input */}
      <Input
        label="Email address"
        id="email"
        type="email"
        placeholder="name@company.com"
        required
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email', VALIDATION_RULES.email)}
      />

      {/* Password Input */}
      <div>
        <PasswordInput
          label="Password"
          id="password"
          placeholder="Enter your password"
          required
          error={errors.password?.message}
          {...register('password', VALIDATION_RULES.password)}
        />

        <div className="flex items-center justify-between mt-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 rounded-sm"
              {...register('rememberMe')}
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        size="md"
        rightIcon={<ArrowRight className="w-4 h-4" />}
        className="mt-2"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in to account'}
      </Button>

      {/* Social Login */}
      <SocialLogin onSocialSuccess={handleSocialSuccess} />

      {/* Register Link */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Sign up for free
        </Link>
      </p>
    </form>
  );
}
