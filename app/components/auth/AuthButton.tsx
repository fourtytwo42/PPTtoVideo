'use client';

import { LoadingButton, LoadingButtonProps } from '@/app/components/ui/LoadingButton';

/**
 * Reusable button for authentication forms.
 * Provides consistent styling and loading states for login and register pages.
 */
export function AuthButton({ children, loading, ...props }: LoadingButtonProps) {
  return (
    <LoadingButton
      fullWidth
      variant="contained"
      loading={loading}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}

export default AuthButton;

