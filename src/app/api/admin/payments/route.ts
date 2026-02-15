import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = cookies().get('session');
  if (!session?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const list = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    return NextResponse.json({ payments: list });
  } catch (error) {
    console.error('Admin payments error:', error);
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 });
  }
}
