import AdminConsoleClient from './admin-client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminConsolePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  const [users, auditLogs] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { actor: true } }),
  ]);

  const serializedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }));

  const serializedLogs = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    metadata: log.metadata,
    createdAt: log.createdAt.toISOString(),
    actor: log.actor ? { id: log.actor.id, name: log.actor.name, email: log.actor.email } : null,
  }));

  return <AdminConsoleClient users={serializedUsers} auditLogs={serializedLogs} />;
}
