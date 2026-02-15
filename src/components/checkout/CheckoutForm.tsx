'use client';

import { useState } from 'react';
import { CreditCard, Building2, Smartphone, Check, Loader2, AlertCircle } from 'lucide-react';
import ReCaptcha from '@/components/ReCaptcha';

type PaymentMethod = 'card' | 'ach' | 'applepay' | 'googlepay';

interface Props {
  enableCards: boolean;
  enableACH: boolean;
  enableApplePay: boolean;
  enableGooglePay: boolean;
}

export default function CheckoutForm({ enableCards, enableACH, enableApplePay, enableGooglePay }: Props) {
  const [method, setMethod] = useState<PaymentMethod>(enableCards ? 'card' : enableACH ? 'ach' : 'applepay');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Customer info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardZip, setCardZip] = useState('');

  // ACH fields
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('PERSONAL_CHECKING');

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!captchaToken) {
        setError('Please complete the reCAPTCHA verification');
        setLoading(false);
        return;
      }

      const captchaRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: captchaToken }),
      });
      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        setError('reCAPTCHA verification failed. Please try again.');
        setCaptchaToken(null);
        setLoading(false);
        return;
      }

      const payload: Record<string, unknown> = {
        name,
        email,
        phone,
        amount: parseFloat(amount),
        description,
        paymentMethod: method,
      };

      if (method === 'card') {
        const digits = cardNumber.replace(/\s/g, '');
        const [expMonth, expYear] = cardExpiry.split('/');
        payload.card = {
          number: digits,
          expMonth,
          expYear: `20${expYear}`,
          cvc: cardCvc,
          name,
          address: { postalCode: cardZip },
        };
      } else if (method === 'ach') {
        payload.bankAccount = {
          name,
          routingNumber,
          accountNumber,
          accountType: accountType || 'PERSONAL_CHECKING',
          phone: phone.replace(/\D/g, '') || '0000000000',
        };
      }

      const res = await fetch('/api/quickbooks/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Show appropriate message based on status
      if (data.status === 'processing') {
        setSuccessMessage(data.message || 'Payment is being processed.');
      } else {
        setSuccessMessage(data.message || 'Payment successful!');
      }
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-[var(--color-success)]" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{successMessage || 'Payment Successful!'}</h2>
        <p className="text-[var(--color-text-muted)] mb-6">
          Thank you, {name}. Your payment of ${parseFloat(amount).toFixed(2)} has been submitted.
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          A confirmation will be sent to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount */}
      <div className="card p-6">
        <label className="block text-sm font-semibold mb-2">Payment Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--color-text-muted)]">$</span>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="input !text-3xl !font-bold !pl-10 !py-4"
          />
        </div>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What is this payment for? (optional)"
          className="input mt-3 text-sm"
        />
      </div>

      {/* Customer Info */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-text-muted)]">Your Information</h3>
        <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="input" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="input" />
          <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="input" />
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="card p-6">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Payment Method</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {enableCards && (
            <button type="button" onClick={() => setMethod('card')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${method === 'card' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
              <CreditCard size={24} className={method === 'card' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
              <span className="text-xs font-medium">Card</span>
            </button>
          )}
          {enableACH && (
            <button type="button" onClick={() => setMethod('ach')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${method === 'ach' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
              <Building2 size={24} className={method === 'ach' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
              <span className="text-xs font-medium">Bank</span>
            </button>
          )}
          {enableApplePay && (
            <button type="button" onClick={() => setMethod('applepay')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${method === 'applepay' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
              <Smartphone size={24} className={method === 'applepay' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
              <span className="text-xs font-medium">Apple Pay</span>
            </button>
          )}
          {enableGooglePay && (
            <button type="button" onClick={() => setMethod('googlepay')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${method === 'googlepay' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}`}>
              <Smartphone size={24} className={method === 'googlepay' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
              <span className="text-xs font-medium">Google Pay</span>
            </button>
          )}
        </div>

        {/* Card Fields */}
        {method === 'card' && (
          <div className="mt-6 space-y-4">
            <input
              required
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="Card Number"
              maxLength={19}
              className="input font-mono tracking-wider"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                required
                value={cardExpiry}
                onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="input font-mono"
              />
              <input
                required
                value={cardCvc}
                onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="CVC"
                maxLength={4}
                className="input font-mono"
              />
              <input
                required
                value={cardZip}
                onChange={e => setCardZip(e.target.value.slice(0, 10))}
                placeholder="ZIP Code"
                className="input"
              />
            </div>
          </div>
        )}

        {/* ACH Fields */}
        {method === 'ach' && (
          <div className="mt-6 space-y-4">
            <select
              value={accountType}
              onChange={e => setAccountType(e.target.value)}
              className="input"
            >
              <option value="PERSONAL_CHECKING">Personal Checking</option>
              <option value="PERSONAL_SAVINGS">Personal Savings</option>
              <option value="BUSINESS_CHECKING">Business Checking</option>
              <option value="BUSINESS_SAVINGS">Business Savings</option>
            </select>
            <input
              required
              value={routingNumber}
              onChange={e => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="Routing Number (9 digits)"
              maxLength={9}
              className="input font-mono tracking-wider"
            />
            <input
              required
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
              placeholder="Account Number"
              maxLength={17}
              className="input font-mono tracking-wider"
            />
          </div>
        )}

        {/* Digital Wallet Placeholder */}
        {(method === 'applepay' || method === 'googlepay') && (
          <div className="mt-6 p-8 rounded-xl border border-dashed border-[var(--color-border)] text-center">
            <Smartphone size={32} className="text-[var(--color-text-muted)] mx-auto mb-3" />
            <p className="text-[var(--color-text-muted)] text-sm">
              {method === 'applepay' ? 'Apple Pay' : 'Google Pay'} will open when you click Pay Now.
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Available on supported devices and browsers.
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/30">
          <AlertCircle size={18} className="text-[var(--color-error)] flex-shrink-0" />
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      {/* reCAPTCHA */}
      <div className="flex justify-center p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <ReCaptcha onVerify={(token) => setCaptchaToken(token)} onExpire={() => setCaptchaToken(null)} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !amount || parseFloat(amount) < 1 || !captchaToken}
        className="btn-primary w-full !py-4 !text-lg flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay {amount ? `$${parseFloat(amount).toFixed(2)}` : 'Now'}</>
        )}
      </button>
    </form>
  );
}
