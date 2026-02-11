import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/quickbooks';
import { getSession } from '@/lib/auth';
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
  const state = crypto.randomUUID();
  return NextResponse.redirect(getAuthUrl(state));
}
