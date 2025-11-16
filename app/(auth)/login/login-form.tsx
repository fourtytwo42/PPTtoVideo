'use client';

import { FormEvent, useState } from 'react';
import { Alert } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/app/components/auth/AuthForm';
import { AuthTextField } from '@/app/components/auth/AuthTextField';
import { AuthButton } from '@/app/components/auth/AuthButton';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      router.replace('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Unable to sign in right now. Please try again shortly.');
      setLoading(false);
    }
  };

  return (
    <AuthForm onSubmit={handleSubmit}>
      <AuthTextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        autoComplete="email"
        disabled={loading}
      />
      <AuthTextField
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        autoComplete="current-password"
        disabled={loading}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      <AuthButton type="submit" loading={loading} sx={{ mt: 1 }}>
        Sign in
      </AuthButton>
    </AuthForm>
  );
}
