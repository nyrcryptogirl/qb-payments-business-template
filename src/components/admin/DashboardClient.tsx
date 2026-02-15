'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Users, FileText, CreditCard, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface Transaction {
  id: number;
  amount: string;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  description: string | null;
}

interface Stats {
  totalRevenue: string;
  totalTransactions: number;
  totalCustomers: number;
  totalInvoices: number;
  recentTransactions: Transaction[];
  qbConnected: boolean;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[var(--color-text-muted)]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center text-[var(--color-text-muted)]">
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${parseFloat(stats.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'var(--color-success)' },
    { label: 'Transactions', value: stats.totalTransactions.toString(), icon: CreditCard, color: 'var(--color-primary)' },
    { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'var(--color-accent)' },
    { label: 'Invoices', value: stats.totalInvoices.toString(), icon: FileText, color: 'var(--color-warning)' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Overview of your business payments</p>
      </div>

      {/* QuickBooks Connection Status */}
      <div className={`card p-4 mb-8 flex items-center gap-3 ${stats.qbConnected ? 'border-[var(--color-success)]/30' : 'border-[var(--color-warning)]/30'}`}>
        {stats.qbConnected ? (
          <>
            <CheckCircle size={20} className="text-[var(--color-success)]" />
            <span className="text-sm">Connected to QuickBooks — payments are active</span>
          </>
        ) : (
          <>
            <AlertTriangle size={20} className="text-[var(--color-warning)]" />
            <span className="text-sm">Not connected to QuickBooks — </span>
            <a href="/admin/settings#quickbooks" className="text-sm text-[var(--color-primary)] font-semibold hover:underline">Connect now →</a>
          </>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{card.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${card.color}20` }}>
                <card.icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-black">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="p-5 border-b border-[var(--color-border)]">
          <h2 className="font-bold">Recent Transactions</h2>
        </div>
        {stats.recentTransactions.length === 0 ? (
          <div className="p-10 text-center text-[var(--color-text-muted)]">
            <CreditCard size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transactions yet. Payments will appear here.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTransactions.map(txn => (
                <tr key={txn.id}>
                  <td className="font-mono text-xs">#{txn.id}</td>
                  <td>{txn.description || '—'}</td>
                  <td className="font-semibold">${parseFloat(txn.amount).toFixed(2)}</td>
                  <td className="capitalize">{txn.paymentMethod || '—'}</td>
                  <td>
                    <span className={`badge ${txn.status === 'completed' ? 'badge-success' : txn.status === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="text-[var(--color-text-muted)] text-sm">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
