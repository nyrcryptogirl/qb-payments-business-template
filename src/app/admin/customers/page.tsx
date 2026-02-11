import { db } from '@/lib/db';
import { customers } from '@/lib/db/schema';
import { Users } from 'lucide-react';
export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  let list: any[] = [];
  try { list = await db.select().from(customers).orderBy(customers.createdAt); } catch {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Customers</h1>
        <p className="text-[var(--color-text-muted)] mt-1">All customers who have made payments</p>
      </div>
      <div className="card">
        {list.length === 0 ? (
          <div className="p-10 text-center text-[var(--color-text-muted)]">
            <Users size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No customers yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>QB ID</th><th>Created</th></tr>
            </thead>
            <tbody>
              {list.map((c: any) => (
                <tr key={c.id}>
                  <td className="font-semibold">{c.name}</td>
                  <td className="text-[var(--color-text-muted)]">{c.email || '—'}</td>
                  <td className="text-[var(--color-text-muted)]">{c.phone || '—'}</td>
                  <td className="font-mono text-xs">{c.qbCustomerId || '—'}</td>
                  <td className="text-[var(--color-text-muted)] text-sm">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
