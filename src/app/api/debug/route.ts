import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import { db } from '@/lib/db';
import { settings, services, testimonials } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Check for session cookie (basic auth gate)
  const session = cookies().get('session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  // Step 1: Raw neon() test (bypasses Drizzle entirely)
  let rawSqlResult: { status: string; settingsCount?: number; error?: string } = { status: 'not tested' };
  if (connectionString) {
    try {
      const sql = neon(connectionString);
      const result = await sql`SELECT COUNT(*)::int as c FROM settings`;
      rawSqlResult = { status: 'ok', settingsCount: result[0]?.c };
    } catch (error) {
      rawSqlResult = { status: 'failed', error: String(error) };
    }
  } else {
    rawSqlResult = { status: 'skipped - no connection string' };
  }

  // Step 2: Drizzle ORM test
  let drizzleResult: { status: string; counts?: Record<string, number>; settings?: unknown[]; error?: string } = { status: 'not tested' };
  try {
    const [settingsCount] = await db.select({ count: count() }).from(settings);
    const [servicesCount] = await db.select({ count: count() }).from(services);
    const [testimonialsCount] = await db.select({ count: count() }).from(testimonials);

    // List all setting keys (mask sensitive values)
    const allSettings = await db.select().from(settings);
    const settingsList = allSettings.map(row => {
      const isSensitive = row.key.toLowerCase().includes('secret') || row.key.toLowerCase().includes('password');
      return {
        key: row.key,
        value: isSensitive ? '********' : (row.value ?? '(null)'),
        updatedAt: row.updatedAt,
      };
    });

    drizzleResult = {
      status: 'ok',
      counts: {
        settings: settingsCount.count,
        services: servicesCount.count,
        testimonials: testimonialsCount.count,
      },
      settings: settingsList,
    };
  } catch (error) {
    console.error('Debug endpoint: Drizzle DB query failed:', error);
    drizzleResult = { status: 'failed', error: String(error) };
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    rawSqlTest: rawSqlResult,
    drizzleTest: drizzleResult,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? `set (${process.env.DATABASE_URL.substring(0, 30)}...)` : 'NOT SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? `set (${process.env.POSTGRES_URL.substring(0, 30)}...)` : 'NOT SET',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? 'set' : 'NOT SET',
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? 'set' : 'NOT SET',
      PGHOST: process.env.PGHOST ? 'set' : 'NOT SET',
      PGDATABASE: process.env.PGDATABASE ? 'set' : 'NOT SET',
      PGUSER: process.env.PGUSER ? 'set' : 'NOT SET',
      QB_CLIENT_ID: process.env.QB_CLIENT_ID ? 'set' : 'NOT SET',
      QB_REDIRECT_URI: process.env.QB_REDIRECT_URI ? 'set' : 'NOT SET',
      QB_ENVIRONMENT: process.env.QB_ENVIRONMENT || '(not set)',
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || '(not set)',
      VERCEL_URL: process.env.VERCEL_URL || '(not set)',
      NODE_ENV: process.env.NODE_ENV || '(not set)',
    },
  });
}
