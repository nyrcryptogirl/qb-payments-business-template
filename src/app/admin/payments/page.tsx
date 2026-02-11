import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { CreditCard } from 'lucide-react';
export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  let list: any[] = [];
  try { list = await db.select().from(transactions).orderBy(transactions.createdAt); } catch {}

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Payments</h1>
        <p className="text-[var(--color-text-muted)] mt-1">All payment transactions</p>
      </div>
      <div className="card">
        {list.length === 0 ? (
          <div className="p-10 text-center text-[var(--color-text-muted)]">
            <CreditCard size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No payments yet.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Description</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {list.map((t: any) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs">#{t.id}</td>
                  <td>{t.description || '—'}</td>
                  <td className="font-semibold">${parseFloat(t.amount).toFixed(2)}</td>
                  <td className="capitalize">{t.paymentMethod || '—'}</td>
                  <td>
                    <span className={`badge ${t.status === 'completed' ? 'badge-success' : t.status === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="text-[var(--color-text-muted)] text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
