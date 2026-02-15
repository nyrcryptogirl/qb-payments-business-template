'use client';

import { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  qbCustomerId: string | null;
  createdAt: string;
}

export default function CustomersClient() {
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then(res => res.json())
      .then(data => setList(data.customers || []))
      .catch(err => console.error('Customers load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight">Customers</h1>
          <p className="text-[var(--color-text-muted)] mt-1">All customers who have made payments</p>
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
              {list.map((c) => (
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
