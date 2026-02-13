// Required environment variables (set in Vercel):
// NEXT_PUBLIC_RECAPTCHA_SITE_KEY - Google reCAPTCHA v2 site key (public)
// RECAPTCHA_SECRET_KEY - Google reCAPTCHA v2 secret key (server only)
//
// Register your domain at: https://www.google.com/recaptcha/admin
// Select reCAPTCHA v2 → "I'm not a robot" Checkbox
// Add domains: jetrealestate.online, localhost

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'No reCAPTCHA token provided' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not set');
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await verifyResponse.json();
    console.log('reCAPTCHA verification result:', data.success);

    return NextResponse.json({ success: data.success });
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
