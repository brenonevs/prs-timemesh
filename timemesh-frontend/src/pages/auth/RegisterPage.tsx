import React from 'react';
import { Register } from '../../components/auth/Register';
import { AuthLayout } from '../../layouts/AuthLayout';

export const RegisterPage = () => {
  return (
    <AuthLayout>
      <Register />
    </AuthLayout>
  );
};