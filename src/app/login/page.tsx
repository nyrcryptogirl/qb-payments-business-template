'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn, UserPlus, Database } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [dbReady, setDbReady] = useState(true);
  const [initializingDb, setInitializingDb] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkSetup();
  }, []);

  async function checkSetup() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        setDbReady(true);
        // Check if admin exists
        try {
          const checkRes = await fetch('/api/auth/check');
          if (checkRes.ok) {
            const data = await checkRes.json();
            setHasAdmin(data.hasAdmin);
            if (!data.hasAdmin) {
              setMode('register');
            }
          }
        } catch {
          setHasAdmin(null);
        }
        setCheckingSetup(false);
      } else {
        // DB might not be initialized
        setDbReady(false);
        setCheckingSetup(false);
      }
    } catch {
      setDbReady(false);
      setCheckingSetup(false);
    }
  }

  async function initDb() {
    setInitializingDb(true);
    try {
      const res = await fetch('/api/init');
      if (res.ok) {
        setDbReady(true);
        setHasAdmin(false);
        setMode('register');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to initialize database. Check your POSTGRES_URL.');
      }
    } catch {
      setError('Cannot connect to database. Make sure Vercel Postgres is set up.');
    } finally {
      setInitializingDb(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = mode === 'register' ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (checkingSetup) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-[var(--color-primary)] opacity-10 blur-[120px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[var(--color-accent)] opacity-10 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            QB
          </div>
          {!dbReady ? (
            <>
              <h1 className="text-2xl font-black tracking-tight">First Time Setup</h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Initialize your database to get started</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black tracking-tight">
                {mode === 'register' ? 'Create Admin Account' : 'Admin Login'}
              </h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">
                {mode === 'register' ? 'Set up your first admin account' : 'Sign in to manage your business'}
              </p>
            </>
          )}
        </div>

        {!dbReady ? (
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
              <Database size={20} className="text-[var(--color-warning)] flex-shrink-0" />
              <p className="text-sm">Database tables need to be created. Click below to initialize.</p>
            </div>
            {error && <div className="p-3 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm">{error}</div>}
            <button onClick={initDb} disabled={initializingDb} className="btn-primary w-full flex items-center justify-center gap-2">
              {initializingDb ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
              {initializingDb ? 'Initializing...' : 'Initialize Database'}
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Full Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Your Name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Email</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="admin@business.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1.5">Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="Min 6 characters" minLength={6} />
              </div>
              {error && <div className="p-3 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : mode === 'register' ? <UserPlus size={18} /> : <LogIn size={18} />}
                {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            {hasAdmin === false && (
              <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
                {mode === 'login' ? (
                  <>First time? <button onClick={() => setMode('register')} className="text-[var(--color-primary)] font-medium hover:underline">Create admin account</button></>
                ) : (
                  <>Already set up? <button onClick={() => setMode('login')} className="text-[var(--color-primary)] font-medium hover:underline">Sign in</button></>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
