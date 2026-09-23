import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

export default function ResetPassword() {
  return (
    <AuthLayout
      title="Create new password"
      subtitle="Ensure your account is protected with a strong, memorable passphrase."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
