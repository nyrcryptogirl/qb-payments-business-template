import { db } from './index';
import { settings } from './schema';
import { eq } from 'drizzle-orm';

export type BusinessSettings = {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  logo: string;
  heroImage: string;
  primaryColor: string;
  accentColor: string;
  darkMode: string;
  checkoutTitle: string;
  checkoutDescription: string;
  enableCards: string;
  enableACH: string;
  enableApplePay: string;
  enableGooglePay: string;
  footerText: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
  qbClientId: string;
  qbClientSecret: string;
  qbRedirectUri: string;
  qbEnvironment: string;
};

const defaults: BusinessSettings = {
  businessName: 'Your Business Name',
  tagline: 'Professional services you can trust',
  phone: '(555) 000-0000',
  email: 'hello@yourbusiness.com',
  address: '123 Main Street, City, ST 00000',
  logo: '',
  heroImage: '',
  primaryColor: '#FF3366',
  accentColor: '#00D4FF',
  darkMode: 'false',
  checkoutTitle: 'Secure Payment',
  checkoutDescription: 'Complete your payment securely below.',
  enableCards: 'true',
  enableACH: 'true',
  enableApplePay: 'true',
  enableGooglePay: 'true',
  footerText: '© 2025 Your Business. All rights reserved.',
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  socialLinkedin: '',
  qbClientId: '',
  qbClientSecret: '',
  qbRedirectUri: '',
  qbEnvironment: 'production',
};

export async function getSetting(key: string): Promise<string> {
  try {
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return result[0]?.value ?? defaults[key as keyof BusinessSettings] ?? '';
  } catch {
    return defaults[key as keyof BusinessSettings] ?? '';
  }
}

export async function getAllSettings(): Promise<BusinessSettings> {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (const row of rows) {
      if (row.value !== null) map[row.key] = row.value;
    }
    return { ...defaults, ...map } as BusinessSettings;
  } catch {
    return { ...defaults };
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing.length > 0) {
    await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

export async function setMultipleSettings(pairs: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(pairs)) {
    await setSetting(key, value);
  }
}
