'use client';

import { TextField, TextFieldProps } from '@/app/components/ui/TextField';

/**
 * Reusable text field for authentication forms.
 * Provides consistent styling for login and register pages.
 */
export function AuthTextField(props: TextFieldProps) {
  return <TextField fullWidth variant="outlined" {...props} />;
}

export default AuthTextField;

