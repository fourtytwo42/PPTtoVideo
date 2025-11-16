'use client';

import { FormEvent, useState } from 'react';
import { Alert } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/app/components/auth/AuthForm';
import { AuthTextField } from '@/app/components/auth/AuthTextField';
import { AuthButton } from '@/app/components/auth/AuthButton';

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Registration failed.' }));
        setError(data.error ?? 'Registration failed.');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setLoading(false);
        router.replace('/login');
        return;
      }

      router.replace('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Unable to register right now. Please try again shortly.');
      setLoading(false);
    }
  };

  return (
    <AuthForm onSubmit={handleSubmit}>
      <AuthTextField
        label="Name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        autoComplete="name"
        disabled={loading}
      />
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
        minLength={8}
        autoComplete="new-password"
        disabled={loading}
        helperText="Must be at least 8 characters"
      />
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      <AuthButton type="submit" loading={loading} sx={{ mt: 1 }}>
        Create account
      </AuthButton>
    </AuthForm>
  );
}
