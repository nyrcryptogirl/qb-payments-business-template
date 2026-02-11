import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { settings, services, testimonials } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

export async function GET() {
  // Check for session cookie (basic auth gate)
  const session = cookies().get('session');
  if (!session?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test DB connection with a simple query
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

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      counts: {
        settings: settingsCount.count,
        services: servicesCount.count,
        testimonials: testimonialsCount.count,
      },
      settings: settingsList,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
        POSTGRES_URL: process.env.POSTGRES_URL ? 'set' : 'not set',
        QB_CLIENT_ID: process.env.QB_CLIENT_ID ? 'set' : 'not set',
        QB_REDIRECT_URI: process.env.QB_REDIRECT_URI ? 'set' : 'not set',
        QB_ENVIRONMENT: process.env.QB_ENVIRONMENT || '(not set)',
        NODE_ENV: process.env.NODE_ENV || '(not set)',
      },
    });
  } catch (error) {
    console.error('Debug endpoint: DB connection failed:', error);
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: String(error),
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
        POSTGRES_URL: process.env.POSTGRES_URL ? 'set' : 'not set',
      },
    }, { status: 500 });
  }
}
