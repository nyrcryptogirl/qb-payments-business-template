import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Business Services | Secure Online Payments',
  description: 'Professional business services with secure online payments powered by QuickBooks.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="noise-bg">{children}</body>
    </html>
  );
}
