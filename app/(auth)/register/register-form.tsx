'use client';

import { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const Label = styled.label`
  display: grid;
  gap: 0.45rem;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(213, 210, 255, 0.7);
`;

const Input = styled.input`
  padding: 0.75rem 0.9rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.35);
  color: ${({ theme }) => theme.colors.text};
`;

const Submit = styled.button`
  margin-top: 0.5rem;
  padding: 0.85rem 1.1rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: none;
  background: linear-gradient(135deg, rgba(140, 92, 255, 0.95), rgba(36, 228, 206, 0.95));
  color: #0b0416;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  display: inline-flex;
  justify-content: center;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #ff8ba3;
`;

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
    <Form onSubmit={handleSubmit}>
      <Label>
        Name
        <Input type="text" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" />
      </Label>
      <Label>
        Email
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
      </Label>
      <Label>
        Password
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Label>
      {error && <ErrorText>{error}</ErrorText>}
      <Submit type="submit" disabled={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Submit>
    </Form>
  );
}
