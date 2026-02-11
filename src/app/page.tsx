import { getAllSettings } from '@/lib/db/settings';
import { db } from '@/lib/db';
import { services, testimonials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, CreditCard, Phone, Mail, MapPin, Star, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let config;
  let serviceList: { id: number; name: string; description: string | null; price: string | null; priceType: string | null }[] = [];
  let testimonialList: { id: number; name: string; role: string | null; content: string; rating: number | null }[] = [];

  try {
    config = await getAllSettings();
    serviceList = await db.select().from(services).where(eq(services.isActive, true)).orderBy(services.sortOrder);
    testimonialList = await db.select().from(testimonials).where(eq(testimonials.isActive, true));
  } catch {
    config = {
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
    };
  }

  return (
    <div className="min-h-screen" style={{ '--color-primary': config.primaryColor, '--color-accent': config.accentColor } as React.CSSProperties}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--color-bg)]/80 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {config.logo ? (
              <img src={config.logo} alt={config.businessName} className="h-10 w-auto" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-lg">
                {config.businessName.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg tracking-tight">{config.businessName}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-[var(--color-text-muted)] hover:text-white transition-colors text-sm font-medium">Services</a>
            <a href="#testimonials" className="text-[var(--color-text-muted)] hover:text-white transition-colors text-sm font-medium">Testimonials</a>
            <a href="#contact" className="text-[var(--color-text-muted)] hover:text-white transition-colors text-sm font-medium">Contact</a>
            <Link href="/checkout" className="btn-primary text-sm !py-2.5 !px-5 inline-flex items-center gap-2">
              Pay Now <ArrowRight size={16} />
            </Link>
          </div>
          <Link href="/checkout" className="md:hidden btn-primary text-sm !py-2.5 !px-5">
            Pay Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24">
        {/* Background gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[var(--color-primary)] opacity-10 blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[var(--color-accent)] opacity-10 blur-[120px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span className="text-sm text-[var(--color-text-muted)]">Now accepting online payments</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-in animate-delay-1">
              {config.tagline.split(' ').map((word, i, arr) => (
                i >= arr.length - 2 ? (
                  <span key={i} className="gradient-text">{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              ))}
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-xl mb-10 leading-relaxed animate-fade-in animate-delay-2">
              Experience seamless, secure payments with {config.businessName}. Pay online in seconds with card, bank transfer, or digital wallet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animate-delay-3">
              <Link href="/checkout" className="btn-primary text-lg !py-4 !px-8 inline-flex items-center justify-center gap-2">
                Make a Payment <ArrowRight size={20} />
              </Link>
              <a href="#services" className="btn-secondary text-lg !py-4 !px-8 inline-flex items-center justify-center gap-2">
                View Services <ChevronRight size={20} />
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-12 animate-fade-in animate-delay-4">
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Shield size={16} className="text-[var(--color-success)]" /> SSL Secured
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <CreditCard size={16} className="text-[var(--color-accent)]" /> Cards & ACH
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                <Zap size={16} className="text-[var(--color-warning)]" /> Instant Processing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {serviceList.length > 0 && (
        <section id="services" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-widest">What We Offer</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 tracking-tight">Our Services</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceList.map((service, i) => (
                <div key={service.id} className="card p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 flex items-center justify-center mb-4">
                    <Zap size={24} className="text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-4">{service.description}</p>
                  {service.price && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black gradient-text">${service.price}</span>
                      {service.priceType === 'hourly' && <span className="text-sm text-[var(--color-text-muted)]">/hr</span>}
                      {service.priceType === 'starting_at' && <span className="text-sm text-[var(--color-text-muted)]">starting</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonialList.length > 0 && (
        <section id="testimonials" className="py-24 bg-[var(--color-surface)]/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-widest">Testimonials</span>
              <h2 className="text-4xl md:text-5xl font-black mt-3 tracking-tight">What Clients Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonialList.map((t) => (
                <div key={t.id} className="card p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} size={16} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
                    ))}
                  </div>
                  <p className="text-[var(--color-text-muted)] leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    {t.role && <p className="text-sm text-[var(--color-text-muted)]">{t.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Ready to Get Started?</h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-xl mx-auto">
            Make your payment quickly and securely. We accept all major credit cards, bank transfers, and digital wallets.
          </p>
          <Link href="/checkout" className="btn-primary text-lg !py-4 !px-10 inline-flex items-center gap-2">
            Pay Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="border-t border-[var(--color-border)] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {config.logo ? (
                  <img src={config.logo} alt={config.businessName} className="h-8 w-auto" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
                    {config.businessName.charAt(0)}
                  </div>
                )}
                <span className="font-bold">{config.businessName}</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{config.tagline}</p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Contact</h4>
              <div className="space-y-3">
                <a href={`tel:${config.phone}`} className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
                  <Phone size={14} /> {config.phone}
                </a>
                <a href={`mailto:${config.email}`} className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
                  <Mail size={14} /> {config.email}
                </a>
                <p className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                  <MapPin size={14} /> {config.address}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Quick Links</h4>
              <div className="space-y-3">
                <a href="#services" className="block text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Services</a>
                <Link href="/checkout" className="block text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Make a Payment</Link>
                <Link href="/admin" className="block text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">Admin Portal</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-muted)]">
            {config.footerText}
          </div>
        </div>
      </footer>
    </div>
  );
}
