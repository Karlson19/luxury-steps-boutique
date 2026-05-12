'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import {
  Search,
  X,
  Flame,
  Clock,
} from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

interface FeaturedCategory {
  label: string;
  href: string;
  category?: string;
  fallbackGradient: string;
}

const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    label: 'Heels',
    href: '/products?category=heels',
    category: 'heels',
    fallbackGradient: 'linear-gradient(135deg, #C8102E 0%, #C9956C 100%)',
  },
  {
    label: 'Flats',
    href: '/products?category=flats',
    category: 'flats',
    fallbackGradient: 'linear-gradient(135deg, #C9956C 0%, #1A0A0A 100%)',
  },
  {
    label: 'Handbags',
    href: '/products?category=handbags',
    category: 'handbags',
    fallbackGradient: 'linear-gradient(135deg, #7B1818 0%, #C9956C 100%)',
  },
  {
    label: 'Tote',
    href: '/products?category=tote',
    category: 'tote',
    fallbackGradient: 'linear-gradient(135deg, #C9956C 0%, #FFFAF8 100%)',
  },
  {
    label: 'Crossbody',
    href: '/products?category=crossbody',
    category: 'crossbody',
    fallbackGradient: 'linear-gradient(135deg, #C8102E 0%, #7B1818 100%)',
  },
  {
    label: 'Mini',
    href: '/products?category=mini',
    category: 'mini',
    fallbackGradient: 'linear-gradient(135deg, #FFFAF8 0%, #C9956C 100%)',
  },
];

const RECENT_KEY = 'lsb_recent_searches';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);

  // Real trending products state
  const [trending, setTrending] = useState<Product[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);

  // Fetch top 4 most-viewed products when modal opens
  useEffect(() => {
    if (!open || trending.length > 0) return;
    setLoadingTrending(true);
    fetch('/api/products/trending')
      .then((r) => r.json())
      .then((j) => setTrending(j.data ?? []))
      .catch(() => setTrending([]))
      .finally(() => setLoadingTrending(false));
  }, [open, trending.length]);

  // Load all products once when modal first opens
  useEffect(() => {
    if (!open || products.length > 0) return;
    setLoadingProducts(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((j) => setProducts(j.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [open, products.length]);

  // Hydrate recent searches from sessionStorage on open
  useEffect(() => {
    if (!open) return;
    try {
      const raw = sessionStorage.getItem(RECENT_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {
      setRecents([]);
    }
  }, [open]);

  // Focus input + escape to close
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) desktopInputRef.current?.focus();
      else mobileInputRef.current?.focus();
    }, 60);
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Robust scroll lock
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const prev = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';

    return () => {
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const persistRecent = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecents((prev) => {
      const next = [trimmed, ...prev.filter((p) => p !== trimmed)].slice(0, 6);
      try {
        sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch { /* noop */ }
      return next;
    });
  }, []);

  function removeRecent(term: string) {
    setRecents((prev) => {
      const next = prev.filter((p) => p !== term);
      try {
        sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch { /* noop */ }
      return next;
    });
  }

  const results = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [products, debounced]);

  const totalMatches = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return 0;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    ).length;
  }, [products, debounced]);

  const categoryCovers = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const p of products) {
      const img = p.images?.[0];
      if (!img) continue;
      if (!map[p.category]) map[p.category] = img;
    }
    map.__any = products.find((p) => p.images?.[0])?.images?.[0];
    return map;
  }, [products]);

  const isSearching = debounced.trim().length > 0;
  const isLoadingResults = isSearching && (loadingProducts || query !== debounced);

  if (!open) return null;

  return (
    <>
      {/* Click-away backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-[#1A0A10]/30 animate-fade-in"
        onClick={onClose}
        style={{ animationDuration: '200ms' }}
      />

      {/* Overlay panel — top matches navbar: h-16 mobile, h-[72px] desktop */}
      <div
        className="fixed left-0 right-0 top-16 lg:top-[72px] z-[56] bg-white border-b border-bone overflow-hidden animate-search-enter"
        style={{
          maxHeight: 'calc(85svh)',
          boxShadow: '0 20px 60px rgba(26,10,16,0.12)',
          fontFamily: 'var(--font-jost)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close search"
          className="absolute top-3 right-3 sm:top-4 sm:right-5 lg:right-10 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-champagne hover:bg-bone text-ink-500 hover:text-burgundy transition-all"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85svh)' }}>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-5">

            {/* Mobile search input */}
            <div className="lg:hidden mb-5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" strokeWidth={2} />
                <input
                  ref={mobileInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the collection..."
                  autoComplete="off"
                  enterKeyHint="search"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      persistRecent(query);
                      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
                      onClose();
                    }
                  }}
                  className="w-full bg-champagne rounded-full pl-10 pr-10 py-3.5 border border-bone text-ink placeholder:text-[#C4A4AF] outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 focus:bg-white transition-all"
                  style={{ fontSize: '16px', fontFamily: 'var(--font-jost)', fontWeight: 400 }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-ink-500 hover:text-burgundy transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop search input */}
            <div className="hidden lg:block mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" strokeWidth={2} />
                <input
                  ref={desktopInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for heels, bags, slippers..."
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim()) {
                      persistRecent(query);
                      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
                      onClose();
                    }
                  }}
                  className="w-full bg-champagne rounded-full pl-10 pr-24 py-3.5 border border-bone text-ink placeholder:text-[#C4A4AF] outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 focus:bg-white transition-all"
                  style={{ fontSize: '16px', fontFamily: 'var(--font-jost)', fontWeight: 400 }}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-12 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-ink-500 hover:text-burgundy transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center px-2 py-1 text-[10px] rounded border bg-white border-bone text-ink-500" style={{ fontWeight: 600 }}>
                  ESC
                </kbd>
              </div>
            </div>

            {/* ─── DEFAULT STATE ─── */}
            {!isSearching && (
              <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">

                {/* LEFT: Trending Now (Smart Fallback!) */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flame size={13} className="text-burgundy" strokeWidth={2.5} />
                      <h3
                        className="text-[10px] uppercase text-burgundy"
                        style={{ fontWeight: 700, letterSpacing: '0.2em' }}
                      >
                        {trending.length > 0 ? 'Trending Now' : 'New Arrivals'}
                      </h3>
                    </div>
                    <Link
                      href="/products"
                      onClick={onClose}
                      className="text-[10px] uppercase tracking-wider text-ink-400 hover:text-burgundy transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      View All →
                    </Link>
                  </div>

                  {/* Product Cards */}
                  {loadingTrending || loadingProducts ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-rose-soft rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(trending.length > 0 ? trending : products.slice(0, 4)).map((p, i) => (
                        <div
                          key={p.id}
                          onClick={onClose}
                          style={{ animation: `fadeUp 300ms ease both ${i * 60}ms` }}
                        >
                          <div className="relative">
                            {trending.length > 0 && (
                              <span className="absolute top-2 left-2 z-10 w-5 h-5 bg-burgundy text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                                {i + 1}
                              </span>
                            )}
                            <ProductCard product={p} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recents.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock size={12} className="text-ink-300" strokeWidth={2} />
                        <h3
                          className="text-[10px] uppercase text-ink-400"
                          style={{ fontWeight: 600, letterSpacing: '0.18em' }}
                        >
                          Recent Searches
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recents.map((r) => (
                          <button
                            key={r}
                            onClick={() => setQuery(r)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-champagne border border-bone text-xs text-ink-500 hover:border-burgundy/40 hover:text-burgundy transition-all"
                            style={{ fontWeight: 500 }}
                          >
                            <Clock size={10} className="text-ink-300" />
                            {r}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeRecent(r); }}
                              className="ml-0.5 text-ink-300 hover:text-burgundy"
                            >
                              <X size={10} />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT: Featured Categories */}
                <div className="mt-6 lg:mt-0">
                  <div className="flex items-center gap-2 mb-4">
                    <h3
                      className="text-[10px] uppercase text-ink-400"
                      style={{ fontWeight: 600, letterSpacing: '0.18em' }}
                    >
                      Shop by Category
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                    {FEATURED_CATEGORIES.map((c) => {
                      const cover = c.category
                        ? categoryCovers[c.category]
                        : categoryCovers.__any;
                      return (
                        <Link
                          key={c.label}
                          href={c.href}
                          onClick={onClose}
                          className="rounded-2xl overflow-hidden relative aspect-square cursor-pointer hover:-translate-y-1 transition-all duration-200 group"
                          style={{
                            boxShadow: '0 1px 4px rgba(123,29,46,0.07)',
                            background: cover ? '#F5DDE4' : c.fallbackGradient,
                          }}
                        >
                          {cover && (
                            <Image
                              src={cover}
                              alt={c.label}
                              fill
                              sizes="(max-width: 768px) 33vw, 140px"
                              className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A10]/75 via-[#1A0A10]/15 to-transparent" />
                          <span
                            className="absolute bottom-2.5 left-3 text-[10px] uppercase tracking-wider text-white drop-shadow"
                            style={{ fontWeight: 600 }}
                          >
                            {c.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── RESULTS STATE ─── */}
            {isSearching && (
              <div>
                <div className="flex items-center justify-between mb-4 gap-3">
                  <p className="text-sm text-ink-500" style={{ fontWeight: 300 }}>
                    {isLoadingResults
                      ? 'Searching...'
                      : `${totalMatches} ${totalMatches === 1 ? 'result' : 'results'} for `}
                    {!isLoadingResults && (
                      <span className="text-ink" style={{ fontWeight: 600 }}>
                        &ldquo;{debounced}&rdquo;
                      </span>
                    )}
                  </p>
                  {totalMatches > 0 && (
                    <Link
                      href={`/products?search=${encodeURIComponent(debounced)}`}
                      onClick={() => { persistRecent(debounced); onClose(); }}
                      className="text-xs text-burgundy uppercase tracking-wider hover:text-burgundy-light transition-colors flex-shrink-0"
                      style={{ fontWeight: 500 }}
                    >
                      View all →
                    </Link>
                  )}
                </div>

                {isLoadingResults ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-rose-mid rounded-2xl animate-pulse aspect-[3/4]" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {results.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { persistRecent(debounced); onClose(); }}
                        >
                          <ProductCard product={p} />
                        </div>
                      ))}
                    </div>
                    {totalMatches > results.length && (
                      <div className="text-center mt-5">
                        <Link
                          href={`/products?search=${encodeURIComponent(debounced)}`}
                          onClick={() => { persistRecent(debounced); onClose(); }}
                          className="inline-flex items-center gap-1.5 text-xs text-burgundy uppercase tracking-wider hover:text-burgundy-light transition-colors"
                          style={{ fontWeight: 600 }}
                        >
                          View all {totalMatches} results →
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <Search className="w-12 h-12 text-[#E8C4CC] mx-auto mb-4" strokeWidth={1.5} />
                    <p className="text-2xl text-ink" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}>
                      No results for &ldquo;{debounced}&rdquo;
                    </p>
                    <p className="text-sm text-ink-500 mt-1 mb-6" style={{ fontWeight: 300 }}>
                      Try different keywords or browse all products.
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <Link
                        href="/products"
                        onClick={onClose}
                        className="bg-burgundy text-white rounded-full px-6 py-3 text-xs uppercase tracking-wider hover:bg-burgundy-light active:scale-[0.97] transition-all"
                        style={{ fontWeight: 600, boxShadow: '0 4px 12px rgba(123,29,46,0.20)' }}
                      >
                        Browse All Products
                      </Link>
                                           <a
                        href="https://wa.me/233599670944?text=Hi!%20I%20can%27t%20find%20what%20I%27m%20looking%20for."
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="bg-[#25D366] text-white rounded-full px-6 py-3 text-xs uppercase tracking-wider hover:bg-[#22bf5b] active:scale-[0.97] transition-all inline-flex items-center gap-2 shadow-lg shadow-[#25D366]/20"
                        style={{ fontWeight: 600 }}
                      >
                        <WhatsAppIcon size={15} />
                        Chat with Us
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes search-enter {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-search-enter {
          animation: search-enter 200ms ease-out both;
        }
      `}</style>
    </>
  );
}
