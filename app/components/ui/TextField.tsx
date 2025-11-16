'use client';

import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { forwardRef } from 'react';

export type TextFieldProps = MuiTextFieldProps;

/**
 * Unified text field component that matches the app's design system.
 * Replaces all custom styled input components.
 */
export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (props, ref) => {
    return (
      <MuiTextField
        ref={ref}
        variant="outlined"
        fullWidth
        {...props}
      />
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;

