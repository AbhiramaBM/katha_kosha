import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { VALIDATION_RULES } from '../../utils/validation';
import { Input } from '../common/Input';
import { PasswordInput } from './PasswordInput';
import { PasswordStrength } from './PasswordStrength';
import { Button } from '../common/Button';
import { SocialLogin } from './SocialLogin';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    }
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setApiError('');
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/verify-email', { state: { email: data.email } });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleSocialSuccess = async () => {
    navigate('/dashboard');
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

      {/* Full Name */}
      <Input
        label="Full name"
        id="name"
        type="text"
        placeholder="e.g. Eleanor Vance"
        required
        leftIcon={<User className="w-4 h-4" />}
        error={errors.name?.message}
        {...register('name', VALIDATION_RULES.name)}
      />

      {/* Email */}
      <Input
        label="Work email"
        id="email"
        type="email"
        placeholder="name@company.com"
        required
        leftIcon={<Mail className="w-4 h-4" />}
        error={errors.email?.message}
        {...register('email', VALIDATION_RULES.email)}
      />

      {/* Password with Strength Indicator */}
      <div>
        <PasswordInput
          label="Password"
          id="password"
          placeholder="Create a strong password"
          required
          error={errors.password?.message}
          {...register('password', VALIDATION_RULES.password)}
        />
        <PasswordStrength password={passwordValue} />
      </div>

      {/* Confirm Password */}
      <PasswordInput
        label="Confirm password"
        id="confirmPassword"
        placeholder="Re-enter your password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password.',
          validate: (val) => {
            if (watch('password') !== val) {
              return 'Passwords do not match.';
            }
          }
        })}
      />

      {/* Terms & Conditions Checkbox */}
      <div className="flex flex-col gap-1 mt-1">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 rounded-sm"
            {...register('terms', VALIDATION_RULES.terms)}
          />
          <span>
            I agree to the{' '}
            <a href="#terms" onClick={(e) => e.preventDefault()} className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-rose-500 font-medium pl-6">{errors.terms.message}</p>
        )}
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
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>

      {/* Social Login */}
      <SocialLogin onSocialSuccess={handleSocialSuccess} />

      {/* Login Link */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
