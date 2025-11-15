import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { RegisterForm } from './register-form';

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <RegisterForm />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
          color: 'rgba(213, 210, 255, 0.7)',
        }}
      >
        <span>Already have an account?</span>
        <Link href="/login" style={{ color: '#8C5CFF', fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    </>
  );
}
