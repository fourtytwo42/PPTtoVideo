'use client';

import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface AuthFormProps extends BoxProps {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * Shared form container for authentication pages.
 * Provides consistent layout and spacing.
 */
export function AuthForm({ children, onSubmit, ...props }: AuthFormProps) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'grid',
        gap: 2,
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export default AuthForm;

