import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { customers } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = cookies().get('session');
  if (!session?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const list = await db.select().from(customers).orderBy(desc(customers.createdAt));
    return NextResponse.json({ customers: list });
  } catch (error) {
    console.error('Admin customers error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}
