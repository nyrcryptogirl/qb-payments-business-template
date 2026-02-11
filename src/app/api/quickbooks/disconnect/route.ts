import { NextResponse } from 'next/server';
import { disconnectFromQB } from '@/lib/quickbooks';
import { requireAuth } from '@/lib/auth';
export async function POST() {
  try { await requireAuth(); await disconnectFromQB(); return NextResponse.json({ success: true }); }
  catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
