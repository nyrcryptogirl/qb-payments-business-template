import './globals.css';
import { getAllSettings } from '@/lib/db/settings';

export async function generateMetadata() {
  try {
    const settings = await getAllSettings();
    return {
      title: `${settings.businessName || 'Business Services'} | Secure Online Payments`,
      description: settings.tagline || 'Professional business services with secure online payments.',
      icons: { icon: settings.faviconUrl || '/favicon.svg' },
    };
  } catch (error) {
    console.error('Layout: Failed to load settings for metadata:', error);
    return {
      title: 'Business Services | Secure Online Payments',
      description: 'Professional business services with secure online payments.',
      icons: { icon: '/favicon.svg' },
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise-bg">{children}</body>
    </html>
  );
}
