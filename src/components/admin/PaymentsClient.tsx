'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface Transaction {
  id: number;
  amount: string;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  description: string | null;
}

export default function PaymentsClient() {
  const [list, setList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(data => setList(data.payments || []))
      .catch(err => console.error('Payments load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Payments</h1>
          <p className="text-[var(--color-text-muted)] mt-1">All payment transactions</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      </div>
    );
  }

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
              {list.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs">#{t.id}</td>
                  <td>{t.description || '—'}</td>
                  <td className="font-semibold">${parseFloat(t.amount).toFixed(2)}</td>
                  <td className="capitalize">{t.paymentMethod || '—'}</td>
                  <td>
                    <span className={`badge ${t.status === 'completed' ? 'badge-success' : t.status === 'failed' || t.status === 'declined' ? 'badge-error' : t.status === 'processing' ? 'badge-info' : 'badge-warning'}`}>
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
