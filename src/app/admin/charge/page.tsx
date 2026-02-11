'use client';
import { useState } from 'react';
import { Zap, Loader2, Check, AlertCircle, CreditCard, Building2 } from 'lucide-react';

export default function ChargePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card');
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  // ACH fields
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<string>('PERSONAL_CHECKING');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleCharge(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(false);
    try {
      let body;
      if (paymentMethod === 'card') {
        const digits = cardNumber.replace(/\s/g, '');
        const parts = cardExpiry.split('/');
        body = { name, email, phone, amount: parseFloat(amount), description, paymentMethod: 'card', card: { number: digits, expMonth: parts[0], expYear: '20' + parts[1], cvc: cardCvc, name } };
      } else {
        body = { name, email, phone, amount: parseFloat(amount), description, paymentMethod: 'ach', bankAccount: { name: accountHolderName || name, routingNumber, accountNumber, accountType, phone } };
      }
      const res = await fetch('/api/quickbooks/charge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Charge failed'); }
    finally { setLoading(false); }
  }

  function resetForm() {
    setSuccess(false); setName(''); setEmail(''); setPhone(''); setAmount(''); setDescription('');
    setCardNumber(''); setCardExpiry(''); setCardCvc('');
    setRoutingNumber(''); setAccountNumber(''); setAccountType('PERSONAL_CHECKING'); setAccountHolderName('');
  }

  const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0,16).replace(/(\d{4})(?=\d)/g, '$1 ');
  const fmtExp = (v: string) => { const d = v.replace(/\D/g, '').slice(0,4); return d.length>=3 ? d.slice(0,2)+'/'+d.slice(2) : d; };

  if (success) {
    return (
      <div>
        <div className="mb-8"><h1 className="text-3xl font-black tracking-tight">Charge Customer</h1></div>
        <div className="card p-10 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mx-auto mb-6"><Check size={32} className="text-[var(--color-success)]" /></div>
          <h2 className="text-2xl font-bold mb-2">Payment Processed!</h2>
          <p className="text-[var(--color-text-muted)]">${parseFloat(amount).toFixed(2)} charged to {name}</p>
          <button onClick={resetForm} className="btn-primary mt-6">Charge Another</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-black tracking-tight">Charge Customer</h1><p className="text-[var(--color-text-muted)] mt-1">Process a payment from the dashboard</p></div>
      <form onSubmit={handleCharge} className="max-w-lg space-y-6">
        <div className="card p-6 space-y-4">
          <h3 className="font-bold">Customer</h3>
          <input required value={name} onChange={e=>setName(e.target.value)} className="input" placeholder="Customer Name" />
          <div className="grid grid-cols-2 gap-4">
            <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" placeholder="Email" />
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="input" placeholder="Phone" />
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="font-bold">Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" step="0.01" min="1" value={amount} onChange={e=>setAmount(e.target.value)} className="input" placeholder="Amount ($)" />
            <input value={description} onChange={e=>setDescription(e.target.value)} className="input" placeholder="Description" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${paymentMethod === 'card' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]'}`}>
              <CreditCard size={16} /> Card
            </button>
            <button type="button" onClick={() => setPaymentMethod('ach')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${paymentMethod === 'ach' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]'}`}>
              <Building2 size={16} /> ACH Bank Transfer
            </button>
          </div>
          {paymentMethod === 'card' ? (
            <>
              <input required value={cardNumber} onChange={e=>setCardNumber(fmtCard(e.target.value))} className="input font-mono" placeholder="Card Number" maxLength={19} />
              <div className="grid grid-cols-2 gap-4">
                <input required value={cardExpiry} onChange={e=>setCardExpiry(fmtExp(e.target.value))} className="input font-mono" placeholder="MM/YY" maxLength={5} />
                <input required value={cardCvc} onChange={e=>setCardCvc(e.target.value.replace(/\D/g,'').slice(0,4))} className="input font-mono" placeholder="CVC" maxLength={4} />
              </div>
            </>
          ) : (
            <>
              <input required value={accountHolderName} onChange={e=>setAccountHolderName(e.target.value)} className="input" placeholder="Account Holder Name" />
              <div className="grid grid-cols-2 gap-4">
                <input required value={routingNumber} onChange={e=>setRoutingNumber(e.target.value.replace(/\D/g,'').slice(0,9))} className="input font-mono" placeholder="Routing Number" maxLength={9} />
                <input required value={accountNumber} onChange={e=>setAccountNumber(e.target.value.replace(/\D/g,'').slice(0,17))} className="input font-mono" placeholder="Account Number" maxLength={17} />
              </div>
              <select value={accountType} onChange={e=>setAccountType(e.target.value)} className="input">
                <option value="PERSONAL_CHECKING">Personal Checking</option>
                <option value="PERSONAL_SAVINGS">Personal Savings</option>
                <option value="BUSINESS_CHECKING">Business Checking</option>
                <option value="BUSINESS_SAVINGS">Business Savings</option>
              </select>
            </>
          )}
        </div>
        {error && <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-error)]/10"><AlertCircle size={18} className="text-[var(--color-error)]" /><p className="text-sm text-[var(--color-error)]">{error}</p></div>}
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          {loading ? 'Processing...' : 'Charge Customer'}
        </button>
      </form>
    </div>
  );
}
