import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { verifyEmail, currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // If token provided in URL, auto-verify
  useEffect(() => {
    if (token) {
      setStatus('verifying');
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 2500);
        })
        .catch(() => {
          setStatus('error');
        });
    }
  }, [token, verifyEmail, navigate]);

  // Countdown timer handler for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60);
      toast.success('Verification email resent. Please check your inbox.');
    }, 1000);
  };

  const handleSimulateVerify = async () => {
    setStatus('verifying');
    try {
      await verifyEmail('simulated-valid-token-123');
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Complete your account registration by confirming your email address."
    >
      <div className="flex flex-col items-center text-center py-4">
        {/* Verification Icon based on state */}
        {status === 'success' ? (
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 animate-fade-in">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        ) : status === 'error' ? (
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 animate-fade-in">
            <AlertCircle className="w-8 h-8" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center mb-4">
            <Mail className="w-7 h-7" />
          </div>
        )}

        {/* Content based on state */}
        {status === 'success' ? (
          <>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Email Verified Successfully!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Thank you for verifying your address. Redirecting to your dashboard...
            </p>
            <Link to="/dashboard" className="w-full">
              <Button fullWidth size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          </>
        ) : status === 'error' ? (
          <>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Verification Failed
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              The verification token is invalid or has expired. Please request a new link.
            </p>
            <Button
              variant="outline"
              fullWidth
              size="md"
              disabled={countdown > 0 || isResending}
              isLoading={isResending}
              onClick={handleResend}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend Verification Email'}
            </Button>
          </>
        ) : status === 'verifying' ? (
          <>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Confirming your email...
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Please wait while we validate your security token.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Check your inbox
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
              We sent a verification link to{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentUser?.email || 'your email address'}
              </span>
              . Click the link inside to activate your account.
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button
                variant="primary"
                fullWidth
                size="md"
                onClick={handleSimulateVerify}
              >
                Simulate Clicking Verification Link
              </Button>

              <Button
                variant="outline"
                fullWidth
                size="md"
                disabled={countdown > 0 || isResending}
                isLoading={isResending}
                onClick={handleResend}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend Verification Email'}
              </Button>

              <Link to="/login" className="w-full">
                <Button variant="ghost" fullWidth size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
