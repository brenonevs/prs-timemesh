import React from 'react';
import { Login } from '../../components/auth/Login';
import { AuthLayout } from '../../layouts/AuthLayout';

export const LoginPage = () => {
  return (
    <AuthLayout>
      <Login />
    </AuthLayout>
  );
};