import { getAllSettings } from '@/lib/db/settings';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  let config;
  try {
    config = await getAllSettings();
  } catch {
    config = {
      businessName: 'Jet Real Estate',
      email: 'hello@yourbusiness.com',
      phone: '(555) 000-0000',
      address: '123 Main Street, City, ST 00000',
      primaryColor: '#FF3366',
      accentColor: '#00D4FF',
    };
  }

  const biz = config.businessName || 'Jet Real Estate';

  return (
    <div className="min-h-screen" style={{ '--color-primary': config.primaryColor, '--color-accent': config.accentColor } as React.CSSProperties}>
      <nav className="border-b border-[var(--color-border)] backdrop-blur-xl bg-[var(--color-bg)]/80">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-[var(--color-text-muted)] hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to {biz}</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-12">Effective date: February 1, 2026</p>

        <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Introduction</h2>
            <p>{biz} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services, including our online payment platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Information We Collect</h2>
            <p>We may collect personal information that you voluntarily provide when using our services, including your name, email address, phone number, mailing address, and payment-related information. We also automatically collect certain technical information such as your IP address, browser type, operating system, and browsing behavior through cookies and similar technologies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">How We Use Your Information</h2>
            <p>We use the information we collect to process payments and transactions, communicate with you about our services, send receipts and transaction confirmations, improve and personalize your experience, comply with legal obligations, and prevent fraudulent activity. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Payment Processing</h2>
            <p>Payment details are processed securely by Intuit QuickBooks Payments. We never store raw credit card numbers or bank account details. All payment information is tokenized for your protection. When you submit a payment, your financial data is transmitted directly to our payment processor using industry-standard encryption. We only retain transaction identifiers, amounts, and status information necessary for record-keeping and customer support.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Data Sharing</h2>
            <p>We may share your information with payment processors (Intuit QuickBooks Payments) to complete transactions, service providers who assist in operating our website, and legal authorities when required by law or to protect our rights. We require all third parties to respect the security of your personal data and to treat it in accordance with applicable law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Cookies</h2>
            <p>Our website uses cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze site traffic. You can control cookie settings through your browser preferences. Disabling cookies may affect some features of the website.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Data Security</h2>
            <p>We implement appropriate technical and organizational security measures to protect your personal information, including SSL/TLS encryption for data in transit, secure token-based payment processing, and access controls on our systems. However, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Data Retention</h2>
            <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Transaction records are retained in accordance with applicable tax and financial regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, or delete your personal information, opt out of marketing communications, request a copy of the data we hold about you, and lodge a complaint with a supervisory authority. To exercise any of these rights, please contact us using the information below.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date. Your continued use of our services after any changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our data practices, please contact us at:</p>
            <div className="mt-3 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-1">
              <p className="font-medium text-white">{biz}</p>
              {config.email && <p>Email: {config.email}</p>}
              {config.phone && <p>Phone: {config.phone}</p>}
              {config.address && <p>Address: {config.address}</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
