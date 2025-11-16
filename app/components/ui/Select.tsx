'use client';

import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { forwardRef } from 'react';

export interface SelectProps extends Omit<MuiSelectProps, 'variant'> {
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
}

/**
 * Unified select component that matches the app's design system.
 * Replaces all custom styled select components.
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ label, helperText, fullWidth = true, children, ...props }, ref) => {
    const labelId = label ? `${props.name || 'select'}-label` : undefined;

    return (
      <FormControl ref={ref} fullWidth={fullWidth} variant="outlined">
        {label && <InputLabel id={labelId}>{label}</InputLabel>}
        <MuiSelect
          labelId={labelId}
          label={label}
          {...props}
        >
          {children}
        </MuiSelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

Select.displayName = 'Select';

export default Select;

