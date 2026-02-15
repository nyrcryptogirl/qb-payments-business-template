import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = cookies().get('session');
  if (!session?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const list = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    return NextResponse.json({ invoices: list });
  } catch (error) {
    console.error('Admin invoices error:', error);
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
  }
}
