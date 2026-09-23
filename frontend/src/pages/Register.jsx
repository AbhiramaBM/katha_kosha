import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';

export default function Register() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your 14-day free trial. No credit card required."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
