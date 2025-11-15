import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <>
      <LoginForm />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.9rem',
          color: 'rgba(213, 210, 255, 0.7)',
        }}
      >
        <span>No account yet?</span>
        <Link href="/register" style={{ color: '#8C5CFF', fontWeight: 600 }}>
          Create one
        </Link>
      </div>
    </>
  );
}
