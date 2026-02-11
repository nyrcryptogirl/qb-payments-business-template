'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, CreditCard, FileText, Zap,
  Settings, Link2, LogOut, ChevronRight
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/charge', label: 'Charge Customer', icon: Zap },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/invoices', label: 'Invoices', icon: FileText },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];

export default function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
            QB
          </div>
          <div>
            <p className="font-bold text-sm">Admin Panel</p>
            <p className="text-xs text-[var(--color-text-muted)]">{userName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`admin-nav-item ${isActive ? 'active' : ''}`}>
              <item.icon size={18} />
              <span className="flex-1 text-sm">{item.label}</span>
              {isActive && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* QuickBooks Connection */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <Link href="/admin/settings#quickbooks" className="admin-nav-item">
          <Link2 size={18} />
          <span className="text-sm">QuickBooks</span>
        </Link>
      </div>

      {/* Logout + View Site */}
      <div className="p-4 border-t border-[var(--color-border)] space-y-1">
        <a href="/" target="_blank" className="admin-nav-item text-sm">
          <ChevronRight size={18} />
          View Live Site
        </a>
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="admin-nav-item w-full text-sm text-[var(--color-error)]"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
