import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/app/components/app/AppShell';
import { getCurrentUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <AppShell user={{ id: user.id, name: user.name, email: user.email, role: user.role }}>{children}</AppShell>;
}
