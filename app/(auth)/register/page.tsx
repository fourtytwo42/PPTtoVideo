import { redirect } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { getCurrentUser } from '@/lib/auth';
import { RegisterForm } from './register-form';

const Switcher = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(213, 210, 255, 0.7);
`;

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <RegisterForm />
      <Switcher>
        <span>Already have an account?</span>
        <Link href="/login" style={{ color: '#8C5CFF', fontWeight: 600 }}>
          Sign in
        </Link>
      </Switcher>
    </>
  );
}
