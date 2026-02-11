import './globals.css';
import { getAllSettings } from '@/lib/db/settings';

export async function generateMetadata() {
  let faviconUrl = '/favicon.svg';
  try {
    const settings = await getAllSettings();
    if (settings.faviconUrl) faviconUrl = settings.faviconUrl;
  } catch (error) {
    console.error('Layout: Failed to load favicon setting:', error);
  }
  return {
    title: 'Business Services | Secure Online Payments',
    description: 'Professional business services with secure online payments powered by QuickBooks.',
    icons: { icon: faviconUrl },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise-bg">{children}</body>
    </html>
  );
}
