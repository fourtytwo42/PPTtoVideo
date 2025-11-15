import { redirect } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from './login-form';

const Switcher = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(213, 210, 255, 0.7);
`;

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <LoginForm />
      <Switcher>
        <span>No account yet?</span>
        <Link href="/register" style={{ color: '#8C5CFF', fontWeight: 600 }}>
          Create one
        </Link>
      </Switcher>
    </>
  );
}
