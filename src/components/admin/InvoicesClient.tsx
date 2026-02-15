'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface Invoice {
  id: number;
  amount: string;
  status: string | null;
  qbInvoiceId: string | null;
  createdAt: string;
}

export default function InvoicesClient() {
  const [list, setList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/invoices')
      .then(res => res.json())
      .then(data => setList(data.invoices || []))
      .catch(err => console.error('Invoices load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8"><h1 className="text-3xl font-black tracking-tight">Invoices</h1><p className="text-[var(--color-text-muted)] mt-1">Invoices synced with QuickBooks</p></div>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      </div>
    );
  }

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
              {list.map((inv) => (
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
