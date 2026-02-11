import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen flex">
      <AdminSidebar userName={session.name} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
