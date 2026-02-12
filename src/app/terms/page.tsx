'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function TermsPage() {
  const [config, setConfig] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setConfig(data.settings || {});
      })
      .catch(err => {
        console.error('TermsPage: Failed to load settings:', err);
        setConfig({
          businessName: 'Your Business Name',
          email: 'hello@yourbusiness.com',
          phone: '(555) 000-0000',
          address: '123 Main Street, City, ST 00000',
          primaryColor: '#FF3366',
          accentColor: '#00D4FF',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  const biz = config.businessName || 'Your Business Name';

  return (
    <div className="min-h-screen" style={{ '--color-primary': config.primaryColor || '#FF3366', '--color-accent': config.accentColor || '#00D4FF' } as React.CSSProperties}>
      <nav className="border-b border-[var(--color-border)] backdrop-blur-xl bg-[var(--color-bg)]/80">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-[var(--color-text-muted)] hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to {biz}</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-12">Effective date: February 1, 2026</p>

        <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Acceptance of Terms</h2>
            <p>By accessing or using the {biz} website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services. We reserve the right to modify these terms at any time, and your continued use of the services constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Services Description</h2>
            <p>{biz} provides professional services as described on our website, along with an online payment platform that allows customers to make payments for services rendered. Service availability, pricing, and descriptions are subject to change without prior notice. We make reasonable efforts to ensure accuracy of information displayed on our website but do not guarantee completeness or timeliness.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Payment Terms</h2>
            <p>All payments are processed securely through Intuit QuickBooks Payments. We accept major credit cards, debit cards, and ACH bank transfers as indicated on our checkout page. We do not store raw credit card numbers or bank account details; all payment data is tokenized by our payment processor. By submitting a payment, you authorize us to charge the specified amount to your selected payment method.</p>
            <p className="mt-3">Refunds are handled at the sole discretion of {biz}. If you believe you are entitled to a refund, please contact us directly. Processing times for refunds vary depending on your financial institution. All prices are quoted in US Dollars unless otherwise stated.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">User Accounts</h2>
            <p>Certain features of our services may require you to provide personal information. You agree to provide accurate, current, and complete information and to update it as necessary. You are responsible for maintaining the confidentiality of any account credentials and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, images, and software, is the property of {biz} or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, {biz} and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use our services. Our total liability for any claim arising from these terms shall not exceed the amount you paid to us in the twelve months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless {biz} and its affiliates from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising out of or related to your use of our services, your violation of these terms, or your violation of any rights of a third party.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Termination</h2>
            <p>We reserve the right to suspend or terminate your access to our services at any time, with or without cause, and with or without notice. Upon termination, your right to use the services will immediately cease. Any provisions of these terms that by their nature should survive termination shall remain in effect.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Governing Law</h2>
            <p>These Terms of Service shall be governed by and construed in accordance with the laws of the state in which {biz} operates, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved in the courts of competent jurisdiction in that state.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Changes to Terms</h2>
            <p>We reserve the right to update or modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page with an updated effective date. We encourage you to review these terms periodically. Your continued use of our services after changes are posted constitutes your acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Contact Us</h2>
            <p>If you have questions about these Terms of Service, please contact us at:</p>
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
