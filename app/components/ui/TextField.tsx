'use client';

import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export interface TextFieldProps extends MuiTextFieldProps {
  label?: string;
}

/**
 * Unified text field component that matches the app's design system.
 * Replaces all custom styled input components.
 */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  ({ label, ...props }, ref) => {
    return (
      <MuiTextField
        ref={ref}
        label={label}
        variant="outlined"
        fullWidth
        {...props}
      />
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;

