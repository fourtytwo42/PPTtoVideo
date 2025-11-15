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
    <Form onSubmit={handleSubmit}>
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
          autoComplete="current-password"
        />
      </Label>
      {error && <ErrorText>{error}</ErrorText>}
      <Submit type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Submit>
    </Form>
  );
}
