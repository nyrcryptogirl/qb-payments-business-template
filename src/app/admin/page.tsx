import { db } from '@/lib/db';
import { transactions, customers, invoices } from '@/lib/db/schema';
import { isConnected } from '@/lib/quickbooks';
import { count, sum, eq } from 'drizzle-orm';
import { DollarSign, Users, FileText, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  let stats = { totalRevenue: '0', totalTransactions: 0, totalCustomers: 0, totalInvoices: 0 };
  let qbConnected = false;
  let recentTransactions: { id: number; amount: string; status: string; paymentMethod: string | null; createdAt: Date; description: string | null }[] = [];

  try {
    const [revResult] = await db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.status, 'completed'));
    const [txnCount] = await db.select({ count: count() }).from(transactions);
    const [custCount] = await db.select({ count: count() }).from(customers);
    const [invCount] = await db.select({ count: count() }).from(invoices);

    stats = {
      totalRevenue: revResult?.total || '0',
      totalTransactions: txnCount?.count || 0,
      totalCustomers: custCount?.count || 0,
      totalInvoices: invCount?.count || 0,
    };

    recentTransactions = await db.select().from(transactions).orderBy(transactions.createdAt).limit(10);
    qbConnected = await isConnected();
  } catch {
    // DB not yet set up
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
      <div className={`card p-4 mb-8 flex items-center gap-3 ${qbConnected ? 'border-[var(--color-success)]/30' : 'border-[var(--color-warning)]/30'}`}>
        {qbConnected ? (
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
        {recentTransactions.length === 0 ? (
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
              {recentTransactions.map(txn => (
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
