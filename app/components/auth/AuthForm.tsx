'use client';

import { styled } from '@mui/material';
import { ReactNode, FormEvent } from 'react';

export interface AuthFormProps {
  children: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

const Form = styled('form')({
  display: 'grid',
  gap: 16,
});

/**
 * Shared form container for authentication pages.
 * Provides consistent layout and spacing.
 */
export function AuthForm({ children, onSubmit }: AuthFormProps) {
  return <Form onSubmit={onSubmit}>{children}</Form>;
}

export default AuthForm;

