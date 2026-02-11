import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { FileText } from 'lucide-react';
export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  let list: any[] = [];
  try { list = await db.select().from(invoices).orderBy(invoices.createdAt); } catch {}

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-black tracking-tight">Invoices</h1><p className="text-[var(--color-text-muted)] mt-1">Invoices synced with QuickBooks</p></div>
      <div className="card">
        {list.length === 0 ? (
          <div className="p-10 text-center text-[var(--color-text-muted)]"><FileText size={32} className="mx-auto mb-3 opacity-50" /><p className="text-sm">No invoices yet. They are created automatically when payments are processed.</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Amount</th><th>Status</th><th>QB Invoice</th><th>Created</th></tr></thead>
            <tbody>
              {list.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs">#{inv.id}</td>
                  <td className="font-semibold">${parseFloat(inv.amount).toFixed(2)}</td>
                  <td><span className={`badge ${inv.status==='paid'?'badge-success':inv.status==='overdue'?'badge-error':'badge-info'}`}>{inv.status}</span></td>
                  <td className="font-mono text-xs">{inv.qbInvoiceId || '-'}</td>
                  <td className="text-sm text-[var(--color-text-muted)]">{new Date(inv.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
