'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Zap, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { toast } from '@/components/ui/Toast';

// ✨ NEW: Color Dictionary for visual swatches
const COLOR_MAP: Record<string, string> = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Red': '#DC2626',
  'Navy Blue': '#1E3A8A',
  'Blue': '#2563EB',
  'Gold': '#D4AF37',
  'Silver': '#C0C0C0',
  'Brown': '#78350F',
  'Tan': '#D2B48C',
  'Beige': '#F5F5DC',
  'Cream': '#FFFDD0',
  'Grey': '#9CA3AF',
  'Charcoal': '#374151',
  'Pink': '#EC4899',
  'Rose Gold': '#B76E79',
  'Green': '#16A34A',
  'Emerald': '#065F46',
  'Olive': '#3F6212',
  'Purple': '#9333EA',
  'Lavender': '#D8B4E2',
  'Yellow': '#EAB308',
  'Orange': '#F97316',
  'Burgundy': '#800020',
  'Maroon': '#800000',
  'Teal': '#0D9488',
  'Cyan': '#0891B2',
  'Peach': '#FFDAB9',
  'Mustard': '#FFDB58',
  'Mint': '#3EB489',
};

const CATEGORY_COLORS: Record<string, string> = {
  heels: 'bg-[#C8102E]',
  flats: 'bg-[#C9956C]',
  handbags: 'bg-[#7B1818]',
  tote: 'bg-[#A87850]',
  crossbody: 'bg-[#E63950]',
  mini: 'bg-[#DCB089]',
};

const CATEGORY_LABELS: Record<string, string> = {
  heels: 'Heels',
  flats: 'Flats & Slippers',
  handbags: 'Handbags',
  tote: 'Tote Bags',
  crossbody: 'Crossbody',
  mini: 'Mini Bags',
};

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface Props {
  product: Product;
  priority?: boolean;
  className?: string;
}

export default function ProductCard({ product, priority, className = '' }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(product.id));
  
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const liked = mounted && isWished;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;
  const hasBoth = hasSizes && hasColors;

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;
  const isLowStock = product.stock_count && product.stock_count <= 3 && product.stock_count > 0;

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.in_stock) return;

    // UX Logic 1: If it has BOTH, take them to the product page.
    if (hasBoth) {
      router.push(`/products/${product.slug}`);
      return;
    }
    
    // UX Logic 2: If it ONLY has Sizes, show size picker.
    if (hasSizes) {
      setShowSizePicker(true);
      return;
    }

    // UX Logic 3: If it ONLY has Colors, show color picker.
    if (hasColors) {
      setShowColorPicker(true);
      return;
    }
    
    // UX Logic 4: Neither? Add directly to bag.
    addItem(product, 1);
    setAdded(true);
    toast.success('Added to bag');
    setTimeout(() => setAdded(false), 1400);
  }

  function handleSizeSelect(size: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, size, undefined);
    setShowSizePicker(false);
    setAdded(true);
    toast.success(`Added size ${size} to bag`);
    setTimeout(() => setAdded(false), 1400);
  }

  function handleColorSelect(color: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, undefined, color);
    setShowColorPicker(false);
    setAdded(true);
    toast.success(`Added ${color} to bag`);
    setTimeout(() => setAdded(false), 1400);
  }

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWish(product);
    toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist');
  }

  return (
    <Link href={`/products/${product.slug}`} className={`group block h-full ${className}`}>
      <article className="relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1 active:scale-[0.99] border border-bone/50 flex flex-col h-full">

        {/* IMAGE CONTAINER */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-champagne-50 to-champagne-100 flex-shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-bone via-champagne-100 to-bone animate-pulse" />
          )}

          <Image
            src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/600/800`}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

          {/* TOP BADGES */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
            <div className="flex flex-col gap-1.5">
              {hasDiscount ? (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-lg" style={{ fontFamily: 'var(--font-jost)' }}>
                  <Zap size={10} fill="currentColor" />
                  {discountPercent}% OFF
                </span>
              ) : product.tag ? (
                <span className="bg-burgundy text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-lg" style={{ fontFamily: 'var(--font-jost)' }}>
                  {product.tag}
                </span>
              ) : null}

              {isLowStock && product.in_stock && (
                <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-lg animate-pulse" style={{ fontFamily: 'var(--font-jost)' }}>
                  Only {product.stock_count} left
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={toggleLike}
              aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all duration-300"
            >
              <Heart
                size={15}
                strokeWidth={1.8}
                className={`transition-all duration-300 ${
                  liked ? 'fill-rose-500 text-rose-500' : 'text-ink-500'
                }`}
              />
            </button>
          </div>

          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className={`${CATEGORY_COLORS[product.category] ?? 'bg-ink'} text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md`} style={{ fontFamily: 'var(--font-jost)' }}>
              {CATEGORY_LABELS[product.category]}
            </span>
          </div>

          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="text-center space-y-1">
                <span className="block bg-ink text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl" style={{ fontFamily: 'var(--font-jost)' }}>
                  Sold Out
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CARD CONTENT */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="text-lg sm:text-xl lg:text-2xl leading-tight line-clamp-2 text-ink group-hover:text-burgundy transition-colors duration-300 mb-2" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, letterSpacing: '-0.01em' }}>
            {toTitleCase(product.name)}
          </h3>

          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 mb-3">
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-semibold text-burgundy/60 leading-none" style={{ fontFamily: 'var(--font-jost)' }}>GHS</span>
              <span className="text-2xl sm:text-3xl font-bold text-burgundy tabular-nums leading-none" style={{ fontFamily: 'var(--font-jost)', letterSpacing: '-0.02em' }}>
                {product.price.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
              </span>
            </div>

            {hasDiscount && (
              <div className="flex items-baseline gap-0.5 opacity-45 line-through ml-auto" style={{ fontFamily: 'var(--font-jost)' }}>
                <span className="text-[10px] font-medium text-ink-400 leading-none">GHS</span>
                <span className="text-sm font-medium text-ink-400 tabular-nums leading-none">
                  {product.compare_price!.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
                </span>
              </div>
            )}
          </div>

          {/* COLOUR DOTS — static visual indicator, not interactive */}
          {hasColors && product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2.5 pointer-events-none" aria-hidden="true">
              {product.colors.slice(0, 4).map((c) => {
                const colorKey = Object.keys(COLOR_MAP).find((k) => k.toLowerCase() === c.toLowerCase());
                const hex = colorKey ? COLOR_MAP[colorKey] : '#9CA3AF';
                return (
                  <span
                    key={c}
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-ink-400 font-medium leading-none" style={{ fontFamily: 'var(--font-jost)' }}>
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}

          {/* ACTION BUTTON AREA */}
          <div className="mt-auto pt-2">
            {product.in_stock ? (
              showSizePicker && hasSizes && !hasBoth ? (
                // 🎛️ SMART SIZE PICKER STATE
                <div className="w-full flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200 ease-out" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] uppercase font-bold text-ink-500 tracking-wider" style={{ fontFamily: 'var(--font-jost)' }}>Select Size:</span>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizePicker(false); }} className="p-1 rounded-full text-ink-400 hover:text-burgundy hover:bg-champagne-100 transition-colors" aria-label="Close size picker">
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {product.sizes!.map((size) => (
                      <button key={size} onClick={(e) => handleSizeSelect(size, e)} className="flex-shrink-0 min-w-[36px] h-8 px-3 rounded-lg border border-bone bg-white text-ink text-[11px] font-semibold hover:border-burgundy hover:text-burgundy active:bg-champagne-100 transition-all shadow-sm" style={{ fontFamily: 'var(--font-jost)' }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : showColorPicker && hasColors && !hasBoth ? (
                // 🎨 SMART COLOR PICKER STATE
                <div className="w-full flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200 ease-out" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] uppercase font-bold text-ink-500 tracking-wider" style={{ fontFamily: 'var(--font-jost)' }}>Select Color:</span>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColorPicker(false); }} className="p-1 rounded-full text-ink-400 hover:text-burgundy hover:bg-champagne-100 transition-colors" aria-label="Close color picker">
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                    {product.colors!.map((c) => {
                      const colorKey = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === c.toLowerCase());
                      const hexValue = colorKey ? COLOR_MAP[colorKey] : null;

                      if (hexValue) {
                        return (
                          <button key={c} onClick={(e) => handleColorSelect(c, e)} aria-label={c} title={c} className="flex-shrink-0 w-8 h-8 rounded-full ring-1 ring-gray-200 hover:ring-gray-400 transition-all shadow-sm active:scale-95" style={{ backgroundColor: hexValue }} />
                        );
                      } else {
                        return (
                          <button key={c} onClick={(e) => handleColorSelect(c, e)} className="flex-shrink-0 h-8 px-3 rounded-lg border border-bone bg-white text-ink text-[11px] font-semibold hover:border-burgundy hover:text-burgundy active:bg-champagne-100 transition-all shadow-sm" style={{ fontFamily: 'var(--font-jost)' }}>
                            {c}
                          </button>
                        );
                      }
                    })}
                  </div>
                </div>
              ) : (
                // 🛍️ DEFAULT BUTTON STATE
                <button
                  onClick={handleQuickAdd}
                  className={`w-full font-semibold text-[11px] uppercase tracking-widest py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97] shadow-sm ${
                    added
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-[#1A0A0A] text-white hover:bg-burgundy hover:shadow-burgundy/20'
                  }`}
                  style={{ fontFamily: 'var(--font-jost)' }}
                >
                  {added ? (
                    <>
                      <span className="inline-block animate-bounce">✓</span>
                      <span>Added!</span>
                    </>
                  ) : hasBoth ? (
                    <span>Choose Size &amp; Colour →</span>
                  ) : (
                    <>
                      <ShoppingBag size={13} strokeWidth={2.5} />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              )
            ) : (
              // ❌ OUT OF STOCK STATE
              <div className="w-full bg-bone text-ink-400 font-semibold text-[11px] uppercase tracking-widest py-3 sm:py-3.5 rounded-xl flex items-center justify-center cursor-not-allowed" style={{ fontFamily: 'var(--font-jost)' }}>
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
