'use client';

import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { forwardRef } from 'react';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'contained' | 'outlined' | 'text';
}

/**
 * Unified button component that matches the app's design system.
 * Replaces all custom styled button components.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'contained', children, ...props }, ref) => {
    return (
      <MuiButton ref={ref} variant={variant} {...props}>
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;

