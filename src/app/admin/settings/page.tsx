'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Check, Link2, Unlink, Palette, Globe, CreditCard, MessageSquare, Plus, Trash2, Key, Info, AlertCircle } from 'lucide-react';

interface Service { id?: number; name: string; description: string; price: string; priceType: string; isActive: boolean; }
interface Testimonial { id?: number; name: string; role: string; content: string; rating: number; isActive: boolean; }

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<string>('branding');
  const [qbConnected, setQbConnected] = useState(false);
  const [s, setS] = useState<Record<string, string>>({});
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const loadedSettings = data.settings || {};
        // Auto-fill redirect URI if not set
        if (!loadedSettings.qbRedirectUri && typeof window !== 'undefined') {
          loadedSettings.qbRedirectUri = `${window.location.origin}/api/quickbooks/callback`;
        }
        setS(loadedSettings);
        setServicesList(data.services || []);
        setTestimonialsList(data.testimonials || []);
        setQbConnected(data.qbConnected || false);
      }
    } catch {} finally { setLoading(false); }
  }

  function updateS(key: string, val: string) { setS(prev => ({ ...prev, [key]: val })); }

  async function saveSettings() {
    setSaving(true); setSaved(false);
    try {
      await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings: s, services: servicesList, testimonials: testimonialsList }) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'services', label: 'Services', icon: Globe },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'quickbooks', label: 'QuickBooks', icon: Link2 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Site Settings</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Customize your website and payment settings</p>
        </div>
        <button onClick={saveSettings} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-white border border-[var(--color-border)]'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'branding' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-lg">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Business Name</label><input value={s.businessName||''} onChange={e=>updateS('businessName',e.target.value)} className="input" /></div>
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Tagline</label><input value={s.tagline||''} onChange={e=>updateS('tagline',e.target.value)} className="input" /></div>
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Phone</label><input value={s.phone||''} onChange={e=>updateS('phone',e.target.value)} className="input" /></div>
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Email</label><input value={s.email||''} onChange={e=>updateS('email',e.target.value)} className="input" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Address</label><input value={s.address||''} onChange={e=>updateS('address',e.target.value)} className="input" /></div>
            </div>
          </div>
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-lg">Logo</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Enter a URL to your logo image.</p>
            <input value={s.logo||''} onChange={e=>updateS('logo',e.target.value)} className="input" placeholder="https://example.com/logo.png" />
            {s.logo && <img src={s.logo} alt="Preview" className="h-16 w-auto rounded-lg bg-white/10 p-2" />}
          </div>
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-lg">Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Primary Color</label><div className="flex gap-3 items-center"><input type="color" value={s.primaryColor||'#FF3366'} onChange={e=>updateS('primaryColor',e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0" /><input value={s.primaryColor||'#FF3366'} onChange={e=>updateS('primaryColor',e.target.value)} className="input flex-1" /></div></div>
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Accent Color</label><div className="flex gap-3 items-center"><input type="color" value={s.accentColor||'#00D4FF'} onChange={e=>updateS('accentColor',e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border-0" /><input value={s.accentColor||'#00D4FF'} onChange={e=>updateS('accentColor',e.target.value)} className="input flex-1" /></div></div>
            </div>
            <div className="p-4 rounded-xl border border-[var(--color-border)]"><p className="text-sm text-[var(--color-text-muted)] mb-3">Preview:</p><div className="flex gap-3"><div className="h-12 w-24 rounded-lg" style={{background:s.primaryColor||'#FF3366'}} /><div className="h-12 w-24 rounded-lg" style={{background:s.accentColor||'#00D4FF'}} /><div className="h-12 w-24 rounded-lg" style={{background:`linear-gradient(135deg, ${s.primaryColor||'#FF3366'}, ${s.accentColor||'#00D4FF'})`}} /></div></div>
          </div>
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-lg">Footer</h3>
            <input value={s.footerText||''} onChange={e=>updateS('footerText',e.target.value)} className="input" placeholder="Footer text" />
          </div>
        </div>
      )}

      {tab === 'services' && (
        <div className="space-y-4">
          {servicesList.map((svc,i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between mb-4"><h4 className="font-semibold">Service #{i+1}</h4><button onClick={()=>setServicesList(p=>p.filter((_,idx)=>idx!==i))} className="text-[var(--color-error)] p-2 rounded-lg hover:bg-[var(--color-error)]/10"><Trash2 size={16} /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={svc.name} onChange={e=>{const n=[...servicesList];n[i].name=e.target.value;setServicesList(n);}} className="input" placeholder="Service Name" />
                <div className="flex gap-3"><input type="number" step="0.01" value={svc.price} onChange={e=>{const n=[...servicesList];n[i].price=e.target.value;setServicesList(n);}} className="input flex-1" placeholder="Price" /><select value={svc.priceType} onChange={e=>{const n=[...servicesList];n[i].priceType=e.target.value;setServicesList(n);}} className="input w-36"><option value="fixed">Fixed</option><option value="hourly">Per Hour</option><option value="starting_at">Starting At</option><option value="custom">Custom</option></select></div>
                <div className="md:col-span-2"><textarea value={svc.description} onChange={e=>{const n=[...servicesList];n[i].description=e.target.value;setServicesList(n);}} className="input min-h-[80px]" placeholder="Description" /></div>
              </div>
            </div>
          ))}
          <button onClick={()=>setServicesList(p=>[...p,{name:'',description:'',price:'',priceType:'fixed',isActive:true}])} className="btn-secondary flex items-center gap-2 w-full justify-center"><Plus size={18} /> Add Service</button>
        </div>
      )}

      {tab === 'testimonials' && (
        <div className="space-y-4">
          {testimonialsList.map((t,i) => (
            <div key={i} className="card p-5">
              <div className="flex items-start justify-between mb-4"><h4 className="font-semibold">Testimonial #{i+1}</h4><button onClick={()=>setTestimonialsList(p=>p.filter((_,idx)=>idx!==i))} className="text-[var(--color-error)] p-2 rounded-lg hover:bg-[var(--color-error)]/10"><Trash2 size={16} /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={t.name} onChange={e=>{const n=[...testimonialsList];n[i].name=e.target.value;setTestimonialsList(n);}} className="input" placeholder="Client Name" />
                <input value={t.role} onChange={e=>{const n=[...testimonialsList];n[i].role=e.target.value;setTestimonialsList(n);}} className="input" placeholder="Role / Company" />
                <div className="md:col-span-2"><textarea value={t.content} onChange={e=>{const n=[...testimonialsList];n[i].content=e.target.value;setTestimonialsList(n);}} className="input min-h-[80px]" placeholder="Their review..." /></div>
                <select value={t.rating} onChange={e=>{const n=[...testimonialsList];n[i].rating=parseInt(e.target.value);setTestimonialsList(n);}} className="input"><option value={5}>5 Stars</option><option value={4}>4 Stars</option><option value={3}>3 Stars</option></select>
              </div>
            </div>
          ))}
          <button onClick={()=>setTestimonialsList(p=>[...p,{name:'',role:'',content:'',rating:5,isActive:true}])} className="btn-secondary flex items-center gap-2 w-full justify-center"><Plus size={18} /> Add Testimonial</button>
        </div>
      )}

      {tab === 'payments' && (
        <div className="card p-6 space-y-6">
          <h3 className="font-bold text-lg">Checkout Page</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Title</label><input value={s.checkoutTitle||''} onChange={e=>updateS('checkoutTitle',e.target.value)} className="input" /></div>
            <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Description</label><input value={s.checkoutDescription||''} onChange={e=>updateS('checkoutDescription',e.target.value)} className="input" /></div>
          </div>
          <h3 className="font-bold text-lg pt-4">Payment Methods</h3>
          {[{key:'enableCards',label:'Credit/Debit Cards'},{key:'enableACH',label:'ACH Bank Transfer'},{key:'enableApplePay',label:'Apple Pay'},{key:'enableGooglePay',label:'Google Pay'}].map(pm=>(
            <label key={pm.key} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] cursor-pointer"><input type="checkbox" checked={s[pm.key]!=='false'} onChange={e=>updateS(pm.key,e.target.checked?'true':'false')} className="w-5 h-5 rounded" /><span className="text-sm font-medium">{pm.label}</span></label>
          ))}
        </div>
      )}

      {tab === 'quickbooks' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Key size={20} />
              <h3 className="font-bold text-lg">API Credentials</h3>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30">
              <Info size={16} className="text-[var(--color-primary)] flex-shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)]">These override environment variables if set. Get your credentials from the Intuit Developer portal.</p>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">QB Client ID</label><input value={s.qbClientId||''} onChange={e=>updateS('qbClientId',e.target.value)} className="input font-mono text-sm" placeholder="e.g. AB0i1Gnf..." /></div>
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">QB Client Secret</label><input type="password" value={s.qbClientSecret||''} onChange={e=>updateS('qbClientSecret',e.target.value)} className="input font-mono text-sm" placeholder="Enter your client secret" /></div>
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">QB Redirect URI</label><input value={s.qbRedirectUri || (typeof window !== 'undefined' ? `${window.location.origin}/api/quickbooks/callback` : '')} onChange={e=>updateS('qbRedirectUri',e.target.value)} className="input font-mono text-sm" readOnly /></div>
              <div><label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">QB Environment</label>
                <select value={s.qbEnvironment||'sandbox'} onChange={e=>updateS('qbEnvironment',e.target.value)} className="input">
                  <option value="sandbox">Sandbox</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <h3 className="font-bold text-lg">QuickBooks Connection</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Connect to enable payment processing. Payments deposit directly into your QuickBooks-linked bank account.</p>
            {(!s.qbClientId && !s.qbClientSecret) && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
                <AlertCircle size={18} className="text-[var(--color-warning)] flex-shrink-0" />
                <p className="text-sm">Save your API Credentials above before connecting.</p>
              </div>
            )}
            {qbConnected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30"><Link2 size={20} className="text-[var(--color-success)]" /><span className="font-medium text-[var(--color-success)]">Connected to QuickBooks</span></div>
                <button onClick={async()=>{if(confirm('Disconnect?')){await fetch('/api/quickbooks/disconnect',{method:'POST'});setQbConnected(false);}}} className="btn-secondary text-[var(--color-error)] flex items-center gap-2"><Unlink size={16} /> Disconnect</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30"><Unlink size={20} className="text-[var(--color-warning)]" /><span className="text-sm">Not connected. Click below to authorize.</span></div>
                <a href="/api/quickbooks/connect" className="btn-primary inline-flex items-center gap-2"><Link2 size={18} /> Connect to QuickBooks</a>
              </div>
            )}
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Info size={20} />
              <h3 className="font-bold text-lg">Intuit Developer Portal Settings</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">You must configure these URLs in your Intuit Developer app settings for OAuth to work correctly.</p>
            <div className="space-y-3 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Redirect URIs</p>
                <p className="text-sm font-mono mt-1">{typeof window !== 'undefined' ? `${window.location.origin}/api/quickbooks/callback` : '/api/quickbooks/callback'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Host Domain</p>
                <p className="text-sm font-mono mt-1">{typeof window !== 'undefined' ? window.location.hostname : 'your-domain.com'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Launch URL</p>
                <p className="text-sm font-mono mt-1">{typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Disconnect URL</p>
                <p className="text-sm font-mono mt-1">{typeof window !== 'undefined' ? `${window.location.origin}/api/quickbooks/disconnect` : '/api/quickbooks/disconnect'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">End-User License Agreement URL</p>
                <p className="text-sm font-mono mt-1">{typeof window !== 'undefined' ? `${window.location.origin}/terms` : '/terms'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Privacy Policy URL</p>
                <p className="text-sm font-mono mt-1">{typeof window !== 'undefined' ? `${window.location.origin}/privacy` : '/privacy'}</p>
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">Copy these values into your Intuit Developer app at developer.intuit.com under Keys &amp; credentials.</p>
          </div>
        </div>
      )}
    </div>
  );
}
