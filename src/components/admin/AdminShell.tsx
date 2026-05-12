'use client';

import { ReactNode, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  LogOut, Menu, X, ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const NAV = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/discounts', label: 'Discounts', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, soon: true },
  { href: '/admin/customers', label: 'Customers', icon: Users, soon: true },
];

// ─── NAV LINKS COMPONENT (Extracted for clean Suspense boundaries) ───
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function isActive(item: typeof NAV[0]) {
    const [basePath, query] = item.href.split('?');
    
    if (pathname !== basePath) return false;

    if (query) {
      const params = new URLSearchParams(query);
      let allMatch = true;
      
      params.forEach((val, key) => {
        if (searchParams.get(key) !== val) {
          allMatch = false;
        }
      });
      
      return allMatch;
    }

    if (item.href === '/admin/dashboard' && searchParams.get('filter') === 'all') {
      return false;
    }

    return true;
  }

  return (
    <>
      {NAV.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.soon ? '#' : item.href}
            onClick={(e) => {
              if (item.soon) {
                e.preventDefault();
                return;
              }
              if (onNavigate) onNavigate();
            }}
            className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              active
                ? 'bg-white/10 text-white'
                : item.soon
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon size={15} strokeWidth={2} />
              {item.label}
            </span>
            {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            {item.soon && (
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminShell({ children, title, subtitle, actions }: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✨ FIX: Strict bulletproof scroll lock for mobile touch devices
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileOpen]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  return (
    <div className="min-h-screen bg-champagne">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-ink text-white fixed inset-y-0 left-0 z-40 border-r border-white/5 shadow-2xl">
        {/* Brand */}
        <Link href="/admin/dashboard" className="flex flex-col items-center gap-2 px-6 py-7 border-b border-white/5">
          <BrandLogo size="md" variant="compact" color="white" />
          <p className="text-[9px] text-white/40 tracking-[0.3em] uppercase font-bold">Admin Console</p>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30 px-3 mb-3">Manage</p>
          <Suspense fallback={<div className="h-40 animate-pulse bg-white/5 rounded-xl mx-3" />}>
            <NavLinks />
          </Suspense>
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1 bg-ink">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink size={15} strokeWidth={2} />
            View Store
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={15} strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MAIN COLUMN ─── */}
      <div className="flex flex-col min-h-screen min-w-0 lg:pl-64">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-bone px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-xl hover:bg-bone transition-colors"
          >
            <Menu size={18} className="text-ink" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center" aria-label="Luxury Steps Boutique Admin">
            <BrandLogo size="xs" variant="compact" color="burgundy" animated={false} />
          </Link>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="p-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} className="text-ink-500" />
          </button>
        </header>

        {/* Page header */}
        {(title || actions) && (
          <div className="px-4 sm:px-8 lg:px-12 pt-6 lg:pt-10 pb-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                {subtitle && (
                  <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-burgundy mb-2">
                    {subtitle}
                  </p>
                )}
                {title && (
                  <h1 className="font-black text-ink leading-none tracking-editorial" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
                    {title}
                  </h1>
                )}
              </div>
              {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-8 lg:px-12 pb-20">
          {children}
        </main>
      </div>

      {/* ─── MOBILE NAV DRAWER ─── */}
      {mobileOpen && (
        <>
          {/* ✨ FIX: Added `touch-none` to kill touch events on the background overlay */}
          <div
            className="lg:hidden fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 animate-fade-in touch-none"
            onClick={() => setMobileOpen(false)}
          />
          {/* ✨ FIX: Added `overscroll-none` to stop scroll chaining */}
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-ink text-white z-50 flex flex-col animate-slide-down overscroll-none" style={{ animation: 'slideRight 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}>
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
              <BrandLogo size="sm" variant="compact" color="white" />
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
              <Suspense fallback={<div className="h-40 animate-pulse bg-white/5 rounded-xl mx-3" />}>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </Suspense>
            </nav>
            <div className="px-3 py-4 border-t border-white/5 space-y-1 bg-ink">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5"
              >
                <ExternalLink size={15} />
                View Store
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-red-300 hover:bg-red-500/10">
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </aside>
          <style jsx global>{`
            @keyframes slideRight {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      {/* Decorative welcome blob */}
      <div className="hidden lg:block fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-burgundy/5 via-gold/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
    </div>
  );
}

/** Premium stat card with gradient background, icon, animated counter */
export function StatCard({
  label, value, sub, icon: Icon, gradient, onClick, active, prefix, suffix,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: LucideIcon;
  gradient: string;
  onClick?: () => void;
  active?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`group text-left relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white bg-gradient-to-br ${gradient} shadow-lux-2 transition-all duration-500 ease-lux ${
        onClick
          ? `cursor-pointer hover:shadow-lux-3 hover:-translate-y-1 ${active ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-champagne scale-[1.02]' : ''}`
          : 'cursor-default'
      }`}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:bg-white/15 transition-all" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Icon size={15} strokeWidth={2} className="text-white" />
          </div>
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white/60">{label}</span>
        </div>
        <p className="text-3xl sm:text-4xl font-black tracking-editorial leading-none">
          <CounterInline value={value} prefix={prefix} suffix={suffix} />
        </p>
        {sub && <p className="text-[11px] text-white/60 mt-2 truncate">{sub}</p>}
      </div>
    </button>
  );
}

// Internal counter so StatCard is self-contained
function CounterInline({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = display;
    const duration = 900;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(from + (value - from) * easeOut(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}
