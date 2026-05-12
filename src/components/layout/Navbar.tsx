'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, Heart, Phone } from 'lucide-react';

function InstagramIcon({ size = 11 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { customOrderLink } from '@/lib/whatsapp';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import SearchModal from '@/components/layout/SearchModal';
import BrandLogo from '@/components/ui/BrandLogo';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/contact', label: 'Contact' },
];

// 🛠️ FIXED: These pages have a dark cinematic hero so the navbar starts transparent
const DARK_HERO_PAGES = ['/'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const wishCount = useWishlistStore((s) => s.items.length);
  const pathname = usePathname();

  // 🛠️ FIXED: Navbar is transparent on dark hero pages until user scrolls
  const isDarkPage = DARK_HERO_PAGES.includes(pathname);
  const isLight = !isDarkPage || scrolled;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen((s) => !s); }
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function openCart() { window.dispatchEvent(new Event('cart:open')); }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
          isLight
            ? 'bg-white/95 backdrop-blur-2xl border-b border-gray-200 shadow-sm'
            // 🛠️ FIXED: Fully transparent with a gentle dark-to-clear gradient so icons are visible
            : 'bg-gradient-to-b from-black/50 via-black/20 to-transparent border-transparent'
        }`}
      >
        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-16 lg:h-[72px] gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group" aria-label="Luxury Steps Boutique, home">
            <span className="transition-all duration-500 group-active:scale-95">
              <BrandLogo size="sm" variant="compact" color={isLight ? 'burgundy' : 'white'} />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className={`relative text-xs font-bold tracking-[0.18em] uppercase px-4 py-2 rounded-full transition-all duration-300 ${
                  isLight
                    ? 'text-gray-700 hover:text-[#C8102E] hover:bg-gray-100'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
                {l.label === 'Wishlist' && mounted && wishCount > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 text-[9px] font-black rounded-full flex items-center justify-center ring-2 ${
                    isLight ? 'bg-[#C8102E] text-white ring-white' : 'bg-[#C9956C] text-[#1A0A0A] ring-transparent'
                  }`}>
                    {wishCount > 9 ? '9+' : wishCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">

            {/* Search */}
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className={`flex items-center justify-center transition-all duration-200 active:scale-95 p-2.5 rounded-full lg:px-4 lg:py-2 ${
                isLight
                  ? 'text-gray-700 hover:text-[#C8102E] lg:bg-gray-100 lg:hover:bg-gray-200'
                  : 'text-white hover:bg-white/10 lg:bg-white/10 lg:border lg:border-white/20 lg:hover:bg-white/20'
              }`}
            >
              <Search size={20} strokeWidth={2} className="lg:w-[15px] lg:h-[15px]" />
              <span className="hidden lg:inline ml-2 text-xs font-bold">Search</span>
            </button>

            {/* Cart — desktop only; mobile uses bottom nav */}
            <button onClick={openCart} aria-label="Open cart"
              className={`hidden md:flex relative p-2.5 rounded-full transition-all duration-200 active:scale-95 ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-[#C8102E]' : 'text-white hover:bg-white/10'
              }`}
            >
              <ShoppingBag size={20} strokeWidth={2} />
              {mounted && itemCount > 0 && (
                <span className={`absolute top-1 right-1 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black leading-none ring-2 ${
                  isLight ? 'bg-[#C8102E] text-white ring-white' : 'bg-[#C9956C] text-[#1A0A0A] ring-transparent'
                }`}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Custom order — desktop only */}
            <a href={customOrderLink()} target="_blank" rel="noopener noreferrer"
              className={`hidden lg:flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full transition-all duration-300 ${
                isLight
                  ? 'bg-[#C8102E] text-white hover:bg-[#7B1818] shadow-md shadow-[#C8102E]/20'
                  : 'bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <WhatsAppIcon size={13} />
              Custom
            </a>

            {/* Hamburger */}
            <button
              className={`md:hidden p-2.5 rounded-full transition-all duration-200 active:scale-95 ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-[#C8102E]' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Menu Drawer ─── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-[88vw] max-w-[340px] flex flex-col"
            style={{
              backgroundColor: '#1C0B12',
              backgroundImage: `
                radial-gradient(ellipse 140% 50% at 100% 0%, rgba(184,134,78,0.14) 0%, transparent 55%),
                radial-gradient(ellipse 80% 55% at 0% 100%, rgba(107,39,55,0.45) 0%, transparent 60%)
              `,
              animation: 'drawerIn 300ms cubic-bezier(0.22, 1, 0.36, 1) both',
            }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-5 h-16 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <BrandLogo size="sm" variant="compact" color="white" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all active:scale-90"
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            {/* Body */}
            <div
              className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            >
              {/* Search */}
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left active:scale-[0.98] transition-transform"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <Search size={14} strokeWidth={2} className="text-amber-400/70 flex-shrink-0" />
                <span className="text-white/35 text-sm">Search the collection…</span>
              </button>

              {/* Nav links — Wishlist excluded (already in Quick Actions below) */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400/80 mb-2 px-1">
                  Navigate
                </p>
                <nav className="flex flex-col">
                  {NAV_LINKS.filter((l) => l.label !== 'Wishlist').map((l, i) => {
                    const isActive = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex items-center justify-between py-3.5 transition-all active:opacity-60"
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.07)',
                          animation: 'linkIn 280ms ease both',
                          animationDelay: `${80 + i * 55}ms`,
                        }}
                      >
                        <span className="flex items-center gap-2.5">
                          {/* Active indicator dot */}
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                            isActive ? 'bg-amber-400 scale-100' : 'bg-transparent scale-0'
                          }`} />
                          <span className={`transition-colors duration-200 text-[15px] font-semibold tracking-wide ${
                            isActive
                              ? 'text-amber-400'
                              : 'text-white/85 group-hover:text-amber-400'
                          }`}>
                            {l.label}
                          </span>
                        </span>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isActive
                            ? 'text-amber-400 bg-amber-400/10'
                            : 'text-white/20 group-hover:text-amber-400 group-hover:bg-amber-400/10'
                        }`}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
                              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Quick actions */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400/80 mb-2 px-1">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setMobileOpen(false); openCart(); }}
                    className="flex items-center gap-2.5 rounded-xl p-3.5 text-left active:scale-[0.97] transition-transform"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.13)' }}>
                      <ShoppingBag size={14} strokeWidth={2} className="text-amber-400" />
                      {mounted && itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 text-[#1C0B12] text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                          {itemCount > 9 ? '9+' : itemCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">Bag</p>
                      <p className="text-white/35 text-[10px]">
                        {mounted && itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''}` : 'Empty'}
                      </p>
                    </div>
                  </button>

                  <Link
                    href="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-3.5 active:scale-[0.97] transition-transform"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.13)' }}>
                      <Heart size={14} strokeWidth={2} className="text-amber-400" />
                      {mounted && wishCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 text-[#1C0B12] text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                          {wishCount > 9 ? '9+' : wishCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white text-xs font-bold">Wishlist</p>
                      <p className="text-white/35 text-[10px]">
                        {mounted && wishCount > 0 ? `${wishCount} saved` : 'None saved'}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div
              className="flex-shrink-0 px-5 pt-4 flex flex-col gap-3"
              style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))',
              }}
            >
              <a
                href={customOrderLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold tracking-[0.12em] uppercase text-xs transition-all active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#1C0B12',
                  boxShadow: '0 4px 20px rgba(245,158,11,0.25)',
                }}
              >
                <WhatsAppIcon size={14} />
                Custom Order via WhatsApp
              </a>
              <div className="flex items-center justify-center gap-0.5 pb-1">
                <a href="tel:+233599670944"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white/35 hover:text-white/60 text-[11px] transition-colors">
                  <Phone size={10} /> Call
                </a>
                <span className="w-0.5 h-0.5 rounded-full bg-white/15" />
                <a href="https://wa.me/233599670944" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white/35 hover:text-white/60 text-[11px] transition-colors">
                  <WhatsAppIcon size={10} /> WhatsApp
                </a>
                <span className="w-0.5 h-0.5 rounded-full bg-white/15" />
                <a href="https://www.instagram.com/luxurystepsboutique" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white/35 hover:text-white/60 text-[11px] transition-colors">
                  <InstagramIcon size={10} /> Instagram
                </a>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes drawerIn {
              from { opacity: 0; transform: translateX(100%); }
              to   { opacity: 1; transform: translateX(0); }
            }
            @keyframes linkIn {
              from { opacity: 0; transform: translateX(14px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          ` }} />
        </>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
