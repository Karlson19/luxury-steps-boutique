'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Heart, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';

type Tab = {
  href: string;
  label: string;
  icon: React.ElementType;
  isCart?: boolean;
};

const TABS: Tab[] = [
  { href: '/',          label: 'Home',     icon: Home },
  { href: '/products',  label: 'Shop',     icon: LayoutGrid },
  { href: '/wishlist',  label: 'Wishlist', icon: Heart },
  { href: '/cart',      label: 'Cart',     icon: ShoppingBag, isCart: true },
];

export default function BottomNav() {
  const pathname  = usePathname();
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  const itemCount = useCartStore((s) => s.itemCount());
  const wishCount = useWishlistStore((s) => s.items.length);

  useEffect(() => { setMounted(true); }, []);

  // Auto-hide on scroll down, reveal on scroll up OR when scroll stops
  useEffect(() => {
    let stopTimer: ReturnType<typeof setTimeout>;

    function onScroll() {
      const y = window.scrollY;

      // Always show near the top
      if (y < 80) { setVisible(true); return; }

      if (y > lastScrollY.current + 6) {
        // Scrolling down — hide
        setVisible(false);
      } else if (y < lastScrollY.current - 6) {
        // Scrolling up — show immediately
        setVisible(true);
      }

      lastScrollY.current = y;

      // Reappear 800ms after scrolling stops
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => setVisible(true), 800);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(stopTimer);
    };
  }, []);

  function openCart(e: React.MouseEvent) {
    e.preventDefault();
    window.dispatchEvent(new Event('cart:open'));
  }

  return (
    <nav
      className={`md:hidden fixed left-0 right-0 bottom-0 z-[45] transition-transform duration-300 ease-in-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 -4px 24px rgba(26,10,16,0.07)',
      }}
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ href, label, icon: Icon, isCart }) => {
          const isActive = !isCart && (href === '/' ? pathname === '/' : pathname.startsWith(href));
          const badge = mounted
            ? label === 'Cart' ? itemCount : label === 'Wishlist' ? wishCount : 0
            : 0;

          const inner = (
            <>
              {/* Active pill indicator at top */}
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                  isActive ? 'w-6 bg-[#C8102E]' : 'w-0 bg-transparent'
                }`}
              />

              {/* Icon + badge */}
              <span className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.7}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-[#C8102E]' : 'text-gray-400'
                  }`}
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-[#C8102E] text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>

              {/* Label */}
              <span
                className={`text-[9px] font-bold tracking-wide mt-0.5 transition-colors duration-200 ${
                  isActive ? 'text-[#C8102E]' : 'text-gray-400'
                }`}
                style={{ fontFamily: 'var(--font-jost)' }}
              >
                {label}
              </span>
            </>
          );

          const sharedClass =
            'relative flex flex-col items-center justify-center flex-1 h-full gap-0 active:scale-95 transition-transform duration-100';

          return isCart ? (
            <button key={href} onClick={openCart} className={sharedClass} aria-label="Open cart">
              {inner}
            </button>
          ) : (
            <Link key={href} href={href} className={sharedClass}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
