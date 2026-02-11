import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/quickbooks';
import { getSession } from '@/lib/auth';

export async function GET() {
  const base = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL('/login', base));

  const state = crypto.randomUUID();
  const authUrl = await getAuthUrl(state);

  // Validate that client_id and redirect_uri are not empty/undefined
  const url = new URL(authUrl);
  const clientId = url.searchParams.get('client_id');
  const redirectUri = url.searchParams.get('redirect_uri');

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(
      new URL('/admin/settings?error=missing_credentials', base)
    );
  }

  return NextResponse.redirect(authUrl);
}
