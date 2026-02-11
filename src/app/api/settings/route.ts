import { NextResponse } from 'next/server';
import { getAllSettings, setMultipleSettings } from '@/lib/db/settings';
import { db } from '@/lib/db';
import { services, testimonials } from '@/lib/db/schema';
import { isConnected } from '@/lib/quickbooks';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allSettings = await getAllSettings();
    const svcList = await db.select().from(services).where(eq(services.isActive, true)).orderBy(services.sortOrder);
    const testList = await db.select().from(testimonials).where(eq(testimonials.isActive, true));
    const qbConnected = await isConnected();
    return NextResponse.json({ settings: allSettings, services: svcList, testimonials: testList, qbConnected });
  } catch {
    return NextResponse.json({ settings: {}, services: [], testimonials: [], qbConnected: false });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.settings) await setMultipleSettings(body.settings);
    if (body.services) {
      await db.delete(services);
      for (let i = 0; i < body.services.length; i++) {
        const svc = body.services[i];
        await db.insert(services).values({ name: svc.name, description: svc.description, price: svc.price || null, priceType: svc.priceType || 'fixed', isActive: true, sortOrder: i });
      }
    }
    if (body.testimonials) {
      await db.delete(testimonials);
      for (const t of body.testimonials) {
        await db.insert(testimonials).values({ name: t.name, role: t.role, content: t.content, rating: t.rating || 5, isActive: true });
      }
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
