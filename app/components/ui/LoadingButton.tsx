'use client';

import { LoadingButton as MuiLoadingButton, LoadingButtonProps as MuiLoadingButtonProps } from '@mui/lab';
import { forwardRef } from 'react';

export interface LoadingButtonProps extends Omit<MuiLoadingButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text';
}

/**
 * Button component with built-in loading state.
 * Displays a CircularProgress indicator when loading.
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ variant = 'contained', children, ...props }, ref) => {
    return (
      <MuiLoadingButton ref={ref} variant={variant} {...props}>
        {children}
      </MuiLoadingButton>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;

