import { NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeTokens } from '@/lib/quickbooks';
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const realmId = url.searchParams.get('realmId');
  const base = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  if (!code || !realmId) return NextResponse.redirect(new URL('/admin/settings?error=missing', base));
  try {
    const tokens = await exchangeCodeForTokens(code);
    await storeTokens(realmId, tokens);
    return NextResponse.redirect(new URL('/admin/settings?connected=true', base));
  } catch (err) {
    console.error('QB OAuth error:', err);
    return NextResponse.redirect(new URL('/admin/settings?error=oauth', base));
  }
}
