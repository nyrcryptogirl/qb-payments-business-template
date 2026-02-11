import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const valid = await verifyPassword(password, user.password);
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    await createSession(user.id, user.email, user.name);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
