'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Search, SlidersHorizontal, ChevronDown, X, ShoppingBag,
  ArrowUp, Loader2, Footprints, ShoppingBag as BagIcon,
  Sparkles, Briefcase, Wallet,
  LucideIcon,
} from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import ProductsHero from '@/components/products/ProductsHero';
import { customOrderLink } from '@/lib/whatsapp';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'A — Z' },
];

interface CategoryDef {
  value: string;
  label: string;
  icon: LucideIcon;
}

const CATEGORIES: CategoryDef[] = [
  { value: 'all',       label: 'All',              icon: Sparkles },
  { value: 'heels',     label: 'Heels',            icon: Footprints },
  { value: 'flats',     label: 'Flats & Slippers', icon: Footprints },
  { value: 'handbags',  label: 'Handbags',         icon: BagIcon },
  { value: 'tote',      label: 'Tote Bags',        icon: Briefcase },
  { value: 'crossbody', label: 'Crossbody',        icon: BagIcon },
  { value: 'mini',      label: 'Mini Bags',        icon: Wallet },
];

const PAGE_SIZE = 12;

interface Props {
  initialProducts: Product[];
  initialCategory: string;
}

export default function ProductsClient({ initialProducts, initialCategory }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || 'all');
  const [sort, setSort] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  const priceMax = useMemo(() => {
    if (!initialProducts.length) return 2000;
    return Math.ceil(Math.max(...initialProducts.map((p) => p.price)) / 100) * 100;
  }, [initialProducts]);
  const [maxPrice, setMaxPrice] = useState(priceMax);
  useEffect(() => { setMaxPrice(priceMax); }, [priceMax]);

  // Scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function clearAll() {
    setSearch('');
    setCategory('all');
    setSort('newest');
    setMaxPrice(priceMax);
    setInStockOnly(false);
    setTagFilter([]);
  }

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (inStockOnly) list = list.filter((p) => p.in_stock);
    if (tagFilter.length > 0) list = list.filter((p) => p.tag && tagFilter.includes(p.tag));
    list = list.filter((p) => p.price <= maxPrice);
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [initialProducts, category, search, sort, inStockOnly, maxPrice, tagFilter]);

  // Reset visible count when filters change
  useEffect(() => { setVisible(PAGE_SIZE); }, [category, search, sort, inStockOnly, maxPrice, tagFilter]);

  function loadMore() {
    setLoadingMore(true);
    setTimeout(() => {
      setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
      setLoadingMore(false);
    }, 350);
  }

  const visibleProducts = filtered.slice(0, visible);
  
  // Track active filters for the mobile badge
  const activeFilterCount =
    (inStockOnly ? 1 : 0) +
    (maxPrice < priceMax ? 1 : 0) +
    tagFilter.length +
    (search ? 1 : 0) + 
    (sort !== 'newest' ? 1 : 0);

  const sidebar = (
    <FilterSidebar
      products={initialProducts}
      category={category}
      setCategory={setCategory}
      maxPrice={maxPrice}
      setMaxPrice={setMaxPrice}
      priceMax={priceMax}
      inStockOnly={inStockOnly}
      setInStockOnly={setInStockOnly}
      tagFilter={tagFilter}
      setTagFilter={setTagFilter}
      search={search}
      setSearch={setSearch}
      sort={sort}
      setSort={setSort}
      clearAll={clearAll}
    />
  );

  return (
    <div
      className="bg-champagne min-h-dvh"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(123,29,46,0.03) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Hero banner */}
      <ProductsHero totalCount={initialProducts.length} />

      {/* ─── SLEEK CATEGORY BAR ─── */}
      {/* 🛠️ FIXED: Changed top values to account for navbar height and lowered z-index to 30 */}
      <div className="sticky top-20 sm:top-24 lg:top-[104px] z-30 bg-champagne/90 backdrop-blur-xl border-b border-bone shadow-sm mt-6">
        <div className="max-w-screen-xl mx-auto overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex items-center gap-2 w-max lg:w-auto lg:flex-wrap lg:justify-center">
            {CATEGORIES.map(({ value, label }) => {
              const active = category === value;
              return (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`flex-shrink-0 rounded-full px-5 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 whitespace-nowrap ${
                    active
                      ? 'bg-burgundy text-white shadow-md shadow-burgundy/20 ring-1 ring-burgundy'
                      : 'bg-white text-ink-500 border border-bone hover:border-burgundy/40 hover:text-burgundy shadow-sm'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div id="products" className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 flex gap-6 lg:gap-8">

        {/* Filter sidebar — desktop */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          {/* 🛠️ FIXED: Pushed sidebar down slightly to account for the new category bar position */}
          <div className="sticky top-[180px]">{sidebar}</div>
        </aside>

        {/* Product area */}
        <div className="flex-1 min-w-0">

          {/* ─── CLEAN RESULTS & FILTER ROW ─── */}
          <div className="flex flex-row items-center justify-between mb-6 pb-4 border-b border-bone/50 lg:border-none lg:pb-0 lg:mb-6">
            <p className="text-sm text-ink-500 font-light">
              <span className="font-bold text-ink">{filtered.length}</span> pieces
              {search && <span className="ml-1 italic text-ink-300">for &ldquo;{search}&rdquo;</span>}
              <span className="ml-2 text-gold hidden sm:inline-block">✦</span>
            </p>

            {/* Mobile filter button (Clean text style) */}
            <button
              onClick={() => setShowSheet(true)}
              className="lg:hidden flex items-center gap-2 text-xs font-black tracking-wider uppercase text-ink hover:text-burgundy transition-colors active:scale-95"
            >
              <SlidersHorizontal size={14} strokeWidth={2.5} />
              Filter & Sort
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] bg-burgundy text-white text-[9px] font-black rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Grid or empty state */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-bone shadow-sm">
              <div className="w-20 h-20 bg-rose-soft rounded-full flex items-center justify-center mb-6">
                <ShoppingBag size={32} strokeWidth={1.5} className="text-burgundy" />
              </div>
              <h3 className="font-display text-3xl text-ink mb-2" style={{ fontWeight: 600 }}>
                Nothing found
              </h3>
              <p className="text-sm text-ink-500 font-light max-w-sm mb-8">
                Try adjusting your filters, or browse all pieces to discover something new.
              </p>
              <button
                onClick={clearAll}
                className="bg-gradient-to-r from-ink via-burgundy to-ink bg-[length:200%_100%] hover:bg-[100%_0] text-white rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] shadow-lux-2 active:scale-95 transition-all duration-500 ease-lux"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {visibleProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      animation: `fadeUp 400ms cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(idx * 60, 600)}ms both`,
                    }}
                  >
                    <ProductCard product={p} priority={idx < 4} />
                  </div>
                ))}
              </div>

              {/* Load more */}
              {visible < filtered.length && (
                <div className="text-center mt-12 mb-8">
                  <p className="text-xs font-medium uppercase tracking-wider text-ink-300 mb-3">
                    Showing {visibleProducts.length} of {filtered.length}
                  </p>
                  <div className="bg-bone h-1 rounded-full max-w-[120px] mx-auto mb-6 overflow-hidden">
                    <div
                      className="bg-burgundy h-full rounded-full transition-all duration-500"
                      style={{ width: `${(visibleProducts.length / filtered.length) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 bg-white border border-bone hover:border-burgundy text-ink hover:text-burgundy rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-sm"
                  >
                    {loadingMore ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>Load More <ChevronDown size={14} strokeWidth={2.5} /></>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {showSheet && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-ink/60 backdrop-blur-md z-50 animate-fade-in"
            onClick={() => setShowSheet(false)}
          />
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl"
            style={{
              animation: 'sheetUp 350ms cubic-bezier(0.32, 0.72, 0, 1)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div className="w-12 h-1.5 bg-bone rounded-full mx-auto mt-3 mb-4" />
            <div className="px-6 pb-4 border-b border-bone flex justify-between items-center">
              <h3 className="font-display text-2xl text-ink tracking-editorial" style={{ fontWeight: 600 }}>Filter & Sort</h3>
              <button
                onClick={() => setShowSheet(false)}
                aria-label="Close"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-champagne-100 hover:bg-bone transition-colors"
              >
                <X size={18} className="text-ink" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar">{sidebar}</div>
            <div className="sticky bottom-0 bg-white border-t border-bone px-6 py-5">
              <button
                onClick={() => setShowSheet(false)}
                className="w-full bg-gradient-to-r from-ink via-burgundy to-ink bg-[length:200%_100%] hover:bg-[100%_0] text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-lux-2"
              >
                Show {filtered.length} {filtered.length === 1 ? 'Piece' : 'Pieces'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Scroll-to-top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        className={`fixed right-4 sm:right-8 bottom-24 sm:bottom-24 lg:bottom-8 z-30 w-11 h-11 bg-burgundy text-white rounded-full shadow-lux-2 flex items-center justify-center transition-all duration-300 active:scale-90 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>

      {/* Bottom custom-order CTA */}
      <section className="px-4 sm:px-6 lg:px-10 pb-16 lg:pb-24 mt-8">
        <div className="max-w-screen-xl mx-auto bg-gradient-to-br from-burgundy via-burgundy-light to-burgundy-dark rounded-3xl p-10 sm:p-14 text-center overflow-hidden relative shadow-lux-2">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-gold mb-3">Custom Orders Welcome</p>
            <h2 className="font-display text-3xl sm:text-5xl text-white leading-tight mb-4 tracking-editorial" style={{ fontWeight: 600 }}>
              Can&apos;t find your <em className="not-italic font-light">perfect piece?</em>
            </h2>
            <p className="text-sm text-white/70 mb-8 max-w-md mx-auto leading-relaxed font-medium">
              Chat with us on WhatsApp. Custom outfits, sizes, colors. Anything you can imagine, we can source.
            </p>
            <a
              href={customOrderLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-burgundy font-black text-xs tracking-[0.15em] uppercase px-8 py-4 rounded-full hover:bg-gold hover:text-ink active:scale-95 transition-all shadow-xl"
            >
              <WhatsAppIcon size={15} />
              Start a Conversation
            </a>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes sheetUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (hover: none) {
          .hover-lift { transform: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Filter sidebar (used on desktop & inside mobile sheet) ─── */
function FilterSidebar({
  products, category, setCategory, maxPrice, setMaxPrice, priceMax,
  inStockOnly, setInStockOnly, tagFilter, setTagFilter, clearAll,
  search, setSearch, sort, setSort
}: {
  products: Product[];
  category: string;
  setCategory: (v: string) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  priceMax: number;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  tagFilter: string[];
  setTagFilter: (v: string[]) => void;
  search: string;
  setSearch: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  clearAll: () => void;
}) {
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    products.forEach((p) => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [products]);

  const TAGS = ['New', 'Bestseller', 'Limited', 'Sale'];

  return (
    <div className="space-y-8 pb-8 lg:pb-0">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-xs tracking-[0.2em] uppercase text-ink">Filters</h3>
        <button onClick={clearAll} className="text-[10px] font-bold uppercase tracking-wider text-burgundy hover:underline">
          Reset
        </button>
      </div>

      {/* ─── SEARCH & SORT ─── */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search size={14} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-9 py-3 bg-white border border-bone rounded-xl text-sm font-medium text-ink outline-none focus:border-burgundy focus:ring-4 focus:ring-burgundy/10 transition-all placeholder:text-ink-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink p-1">
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none w-full bg-white border border-bone rounded-xl pl-3.5 pr-9 py-3 text-sm font-medium text-ink cursor-pointer focus:outline-none focus:border-burgundy focus:ring-4 focus:ring-burgundy/10 transition-all"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} strokeWidth={2.5} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        </div>
      </div>

      {/* PRICE RANGE */}
      <div className="border-t border-bone pt-6">
        <h4 className="text-[10px] font-black tracking-[0.18em] uppercase text-ink-400 mb-4">Price Range</h4>
        <input
          type="range"
          min={0}
          max={priceMax}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-burgundy h-1.5 bg-bone rounded-full appearance-none outline-none cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-bold text-ink-500 mt-3 uppercase tracking-wider">
          <span>GHS 0</span>
          <span className="text-ink">GHS {maxPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* CATEGORIES (Only visible in mobile sheet) */}
      <div className="lg:hidden border-t border-bone pt-6">
        <h4 className="text-[10px] font-black tracking-[0.18em] uppercase text-ink-400 mb-3">Categories</h4>
        <div className="space-y-1">
          {CATEGORIES.map(({ value, label, icon: Icon }) => {
            const active = category === value;
            return (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-rose-soft text-burgundy font-black ring-1 ring-burgundy/20'
                    : 'text-ink font-medium hover:bg-champagne-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  active ? 'bg-burgundy/10 text-burgundy' : 'bg-bone text-ink-400'
                }`}>
                  {counts[value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AVAILABILITY */}
      <div className="border-t border-bone pt-6">
        <h4 className="text-[10px] font-black tracking-[0.18em] uppercase text-ink-400 mb-4">Availability</h4>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-ink group-hover:text-burgundy transition-colors">In Stock Only</span>
          <button
            type="button"
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${inStockOnly ? 'bg-emerald-500' : 'bg-bone'}`}
            aria-pressed={inStockOnly}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${inStockOnly ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </label>
      </div>

      {/* TAGS */}
      <div className="border-t border-bone pt-6">
        <h4 className="text-[10px] font-black tracking-[0.18em] uppercase text-ink-400 mb-4">Special Labels</h4>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => {
            const active = tagFilter.includes(t);
            return (
              <button
                key={t}
                onClick={() => {
                  if (active) setTagFilter(tagFilter.filter((x) => x !== t));
                  else setTagFilter([...tagFilter, t]);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  active
                    ? 'bg-ink text-white shadow-md shadow-ink/20'
                    : 'bg-white border border-bone text-ink-500 hover:border-ink hover:text-ink'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
