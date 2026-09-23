import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Reset your password quickly and securely."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
