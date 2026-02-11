import { getAllSettings } from '@/lib/db/settings';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, CreditCard, Building2, Smartphone } from 'lucide-react';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  let config;
  try {
    config = await getAllSettings();
  } catch {
    config = {
      businessName: 'Your Business Name',
      tagline: 'Professional services',
      logo: '',
      primaryColor: '#FF3366',
      accentColor: '#00D4FF',
      checkoutTitle: 'Secure Payment',
      checkoutDescription: 'Complete your payment securely below.',
      enableCards: 'true',
      enableACH: 'true',
      enableApplePay: 'true',
      enableGooglePay: 'true',
      phone: '',
      email: '',
      address: '',
      heroImage: '',
      darkMode: 'false',
      footerText: '',
      socialFacebook: '',
      socialInstagram: '',
      socialTwitter: '',
      socialLinkedin: '',
    };
  }

  return (
    <div className="min-h-screen" style={{ '--color-primary': config.primaryColor, '--color-accent': config.accentColor } as React.CSSProperties}>
      {/* Header */}
      <nav className="border-b border-[var(--color-border)] backdrop-blur-xl bg-[var(--color-bg)]/80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-[var(--color-text-muted)] hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to {config.businessName}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <Lock size={14} className="text-[var(--color-success)]" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Business info */}
        <div className="text-center mb-10">
          {config.logo ? (
            <img src={config.logo} alt={config.businessName} className="h-12 mx-auto mb-4" />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              {config.businessName.charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-black tracking-tight mb-2">{config.checkoutTitle}</h1>
          <p className="text-[var(--color-text-muted)]">{config.checkoutDescription}</p>
        </div>

        {/* Payment methods available */}
        <div className="flex justify-center gap-4 mb-8">
          {config.enableCards === 'true' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              <CreditCard size={14} /> Cards
            </div>
          )}
          {config.enableACH === 'true' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              <Building2 size={14} /> Bank Transfer
            </div>
          )}
          {(config.enableApplePay === 'true' || config.enableGooglePay === 'true') && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
              <Smartphone size={14} /> Digital Wallet
            </div>
          )}
        </div>

        {/* Checkout Form (Client Component) */}
        <CheckoutForm
          enableCards={config.enableCards === 'true'}
          enableACH={config.enableACH === 'true'}
          enableApplePay={config.enableApplePay === 'true'}
          enableGooglePay={config.enableGooglePay === 'true'}
        />

        {/* Security notice */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--color-text-muted)]">
          <Shield size={14} className="text-[var(--color-success)]" />
          Your payment info is encrypted and tokenized. We never store card or bank details.
        </div>
      </div>
    </div>
  );
}
