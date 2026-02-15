import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { transactions, customers, invoices } from '@/lib/db/schema';
import { count, sum, desc, eq } from 'drizzle-orm';
import { isConnected } from '@/lib/quickbooks';

export async function GET() {
  const session = cookies().get('session');
  if (!session?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [revResult] = await db.select({ total: sum(transactions.amount) }).from(transactions).where(eq(transactions.status, 'completed'));
    const [txnCount] = await db.select({ count: count() }).from(transactions);
    const [custCount] = await db.select({ count: count() }).from(customers);
    const [invCount] = await db.select({ count: count() }).from(invoices);
    const recent = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(10);
    const qbConnected = await isConnected();

    return NextResponse.json({
      totalRevenue: revResult.total || '0',
      totalTransactions: txnCount.count,
      totalCustomers: custCount.count,
      totalInvoices: invCount.count,
      recentTransactions: recent,
      qbConnected,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
