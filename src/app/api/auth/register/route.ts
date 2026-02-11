import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { hashPassword, createSession } from '@/lib/auth';
import { count } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    const [existing] = await db.select({ count: count() }).from(users);
    if (existing.count > 0) return NextResponse.json({ error: 'Registration closed' }, { status: 403 });
    const hashed = await hashPassword(password);
    const [user] = await db.insert(users).values({ email, password: hashed, name }).returning();
    await createSession(user.id, user.email, user.name);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
