'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, ShoppingBag, X, ArrowRight, Sparkles, Trash2, Zap } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { quickProductOrderLink } from '@/lib/whatsapp';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { toast } from '@/components/ui/Toast';

const CATEGORY_COLORS: Record<string, string> = {
  heels: 'bg-[#C8102E]', flats: 'bg-[#C9956C]', handbags: 'bg-[#7B1818]',
  tote: 'bg-[#A87850]', crossbody: 'bg-[#E63950]', mini: 'bg-[#DCB089]',
};
const CATEGORY_LABELS: Record<string, string> = {
  heels: 'Heels', flats: 'Flats & Slippers', handbags: 'Handbags',
  tote: 'Tote Bags', crossbody: 'Crossbody', mini: 'Mini Bags',
};
const TAG_BG: Record<string, string> = {
  New: 'bg-gray-900 text-white', Bestseller: 'bg-[#C8102E] text-white',
  Limited: 'bg-amber-500 text-gray-900', Sale: 'bg-red-500 text-white',
};

const COLOR_MAP: Record<string, string> = {
  'Black': '#000000', 'White': '#FFFFFF', 'Red': '#DC2626', 'Navy Blue': '#1E3A8A',
  'Blue': '#2563EB', 'Gold': '#D4AF37', 'Silver': '#C0C0C0', 'Brown': '#78350F',
  'Tan': '#D2B48C', 'Beige': '#F5F5DC', 'Cream': '#FFFDD0', 'Grey': '#9CA3AF',
  'Charcoal': '#374151', 'Pink': '#EC4899', 'Rose Gold': '#B76E79', 'Green': '#16A34A',
  'Emerald': '#065F46', 'Olive': '#3F6212', 'Purple': '#9333EA', 'Lavender': '#D8B4E2',
  'Yellow': '#EAB308', 'Orange': '#F97316', 'Burgundy': '#800020', 'Maroon': '#800000',
  'Teal': '#0D9488', 'Cyan': '#0891B2', 'Peach': '#FFDAB9', 'Mustard': '#FFDB58', 'Mint': '#3EB489',
};

interface WishlistItem {
  id: string; slug: string; name: string; price: number;
  compare_price?: number | null; image: string;
  category: string; in_stock: boolean; tag?: string | null;
  sizes?: string[] | null; colors?: string[] | null;
}

// Used only for "Move All" logic — any variant product needs a choice.
function needsChoice(item: WishlistItem): boolean {
  return !!(
    (item.sizes && item.sizes.length > 0) ||
    (item.colors && item.colors.length > 0)
  );
}

// ─── WishlistCard ─────────────────────────────────────────────────────────────
// Mobile: horizontal (image left, info right). Tablet+: portrait grid card.
function WishlistCard({
  item, onRemove, onMoveToCart, onGoToProduct, index,
}: {
  item: WishlistItem; onRemove: (id: string) => void;
  onMoveToCart: (item: WishlistItem, size?: string, color?: string) => void;
  onGoToProduct: (slug: string) => void;
  index: number;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [moved, setMoved] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const hasDiscount = item.compare_price && item.compare_price > item.price;
  const discountPct = hasDiscount
    ? Math.round(((item.compare_price! - item.price) / item.compare_price!) * 100) : 0;

  const hasSizes = !!(item.sizes && item.sizes.length > 0);
  const hasColors = !!(item.colors && item.colors.length > 0);
  const hasBoth = hasSizes && hasColors;

  function handleMove(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!item.in_stock) return;
    if (hasBoth) { onGoToProduct(item.slug); return; }
    if (hasSizes) { setShowSizePicker(true); return; }
    if (hasColors) { setShowColorPicker(true); return; }
    onMoveToCart(item); setMoved(true);
    setTimeout(() => setMoved(false), 1600);
  }
  function handleSizeSelect(size: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    onMoveToCart(item, size, undefined); setShowSizePicker(false);
    setMoved(true); setTimeout(() => setMoved(false), 1600);
  }
  function handleColorSelect(color: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    onMoveToCart(item, undefined, color); setShowColorPicker(false);
    setMoved(true); setTimeout(() => setMoved(false), 1600);
  }
  function handleRemove(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation(); onRemove(item.id);
  }

  const moveLabel = hasBoth
    ? 'Choose Size & Colour →'
    : hasSizes ? 'Pick a Size →'
    : hasColors ? 'Pick a Colour →'
    : 'Move to Bag';

  return (
    <article
      className="group relative bg-white overflow-hidden transition-all duration-300"
      style={{
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(200,16,46,0.07)',
        border: '1px solid rgba(200,16,46,0.08)',
        animationDelay: `${Math.min(index * 55, 330)}ms`,
      }}
    >
      {/* ── MOBILE: horizontal layout ── */}
      <div className="flex sm:hidden">
        {/* Image — fixed square on left */}
        <Link href={`/products/${item.slug}`} className="relative flex-shrink-0 w-28 h-36 overflow-hidden rounded-l-2xl bg-[#F0EBE3]">
          {!imageLoaded && <div className="absolute inset-0 bg-[#EDE5D8] animate-pulse" />}
          {item.image && (
            <Image src={item.image} alt={item.name} fill
              sizes="112px"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          )}
          {/* Tag */}
          {(hasDiscount || item.tag) && (
            <div className="absolute top-1.5 left-1.5">
              {hasDiscount ? (
                <span className="flex items-center gap-0.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  <Zap size={8} fill="currentColor" />{discountPct}%
                </span>
              ) : (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${TAG_BG[item.tag!] ?? 'bg-gray-900 text-white'}`}>
                  {item.tag}
                </span>
              )}
            </div>
          )}
          {!item.in_stock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wide text-gray-700 bg-white px-2 py-0.5 rounded-full shadow">Sold Out</span>
            </div>
          )}
        </Link>

        {/* Info — right side */}
        <div className="flex-1 flex flex-col justify-between p-3 min-w-0">
          {/* Top row: name + remove */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/products/${item.slug}`} className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                style={{ color: CATEGORY_COLORS[item.category] ? undefined : '#888' }}>
                <span className={`inline-block ${CATEGORY_COLORS[item.category] ?? 'bg-gray-400'} text-white text-[8px] px-1.5 py-0.5 rounded-md`}>
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
              </p>
              <h3
                className="text-gray-900 line-clamp-2 leading-snug"
                style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontWeight: 600, fontSize: '1rem' }}
              >
                {item.name}
              </h3>
            </Link>
            <button onClick={handleRemove}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
              aria-label="Remove">
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-[10px] font-semibold text-[#C8102E]/60" style={{ fontFamily: 'var(--font-jost, sans-serif)' }}>GHS</span>
            <span className="text-xl font-bold text-[#C8102E] tabular-nums leading-none"
              style={{ fontFamily: 'var(--font-jost, sans-serif)', letterSpacing: '-0.02em' }}>
              {item.price.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through opacity-50"
                style={{ fontFamily: 'var(--font-jost, sans-serif)' }}>
                {item.compare_price!.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5">
            {showSizePicker && hasSizes && !hasBoth ? (
              <div className="flex flex-col gap-1.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Select Size:</span>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizePicker(false); }} className="p-1 rounded-full text-gray-400 hover:text-[#C8102E]"><X size={11} strokeWidth={2.5} /></button>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                  {item.sizes!.map((size) => (
                    <button key={size} onClick={(e) => handleSizeSelect(size, e)} className="flex-shrink-0 min-w-[32px] h-7 px-2 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold hover:border-[#C8102E] hover:text-[#C8102E] transition-all">
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : showColorPicker && hasColors && !hasBoth ? (
              <div className="flex flex-col gap-1.5" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Select Colour:</span>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColorPicker(false); }} className="p-1 rounded-full text-gray-400 hover:text-[#C8102E]"><X size={11} strokeWidth={2.5} /></button>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {item.colors!.map((c) => {
                    const key = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === c.toLowerCase());
                    const hex = key ? COLOR_MAP[key] : null;
                    return hex ? (
                      <button key={c} onClick={(e) => handleColorSelect(c, e)} aria-label={c} title={c} className="flex-shrink-0 w-7 h-7 rounded-full ring-1 ring-gray-200 hover:ring-gray-400 active:scale-95 transition-all shadow-sm" style={{ backgroundColor: hex }} />
                    ) : (
                      <button key={c} onClick={(e) => handleColorSelect(c, e)} className="flex-shrink-0 h-7 px-2 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold hover:border-[#C8102E] hover:text-[#C8102E] transition-all">{c}</button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button onClick={handleMove} disabled={!item.in_stock}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl transition-all duration-300 active:scale-[0.97] ${
                    moved ? 'bg-emerald-500 text-white'
                    : item.in_stock ? 'bg-[#1A0A0A] text-white hover:bg-[#C8102E]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}>
                  {moved ? <><span>✓</span><span>Moved!</span></> : !hasBoth && !hasSizes && !hasColors ? <><ShoppingBag size={11} strokeWidth={2.5} /><span>Move to Bag</span></> : <span>{moveLabel}</span>}
                </button>
                <a href={quickProductOrderLink(item.name, item.price, item.slug)}
                  target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-xl transition-all">
                  <WhatsAppIcon size={13} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLET+: portrait card ── */}
      <div className="hidden sm:block">
        {/* Remove button */}
        <button onClick={handleRemove}
          className="absolute top-2.5 right-2.5 z-20 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white hover:scale-110 active:scale-90 transition-all duration-300"
          aria-label="Remove from wishlist">
          <X size={14} strokeWidth={2.5} />
        </button>

        <Link href={`/products/${item.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#F5F0EA] to-[#EDE5D8]">
            {!imageLoaded && <div className="absolute inset-0 bg-[#EDE5D8] animate-pulse" />}
            {item.image && (
              <Image src={item.image} alt={item.name} fill
                sizes="(max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
            <div className="absolute top-2.5 left-2.5 z-10">
              {hasDiscount ? (
                <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-lg">
                  <Zap size={10} fill="currentColor" />{discountPct}% OFF
                </span>
              ) : item.tag ? (
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-lg ${TAG_BG[item.tag] ?? 'bg-gray-900 text-white'}`}>{item.tag}</span>
              ) : null}
            </div>
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <span className={`${CATEGORY_COLORS[item.category] ?? 'bg-gray-700'} text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md`}>
                {CATEGORY_LABELS[item.category] ?? item.category}
              </span>
            </div>
            {!item.in_stock && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                <span className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl">Sold Out</span>
              </div>
            )}
          </div>
          <div className="p-3 sm:p-4">
            <h3 className="leading-tight line-clamp-2 text-gray-900 group-hover:text-[#C8102E] transition-colors duration-300 mb-2"
              style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontWeight: 600, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', letterSpacing: '-0.01em' }}>
              {item.name}
            </h3>
            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-semibold text-[#C8102E]/60 leading-none" style={{ fontFamily: 'var(--font-jost, sans-serif)' }}>GHS</span>
                <span className="text-2xl font-bold text-[#C8102E] tabular-nums leading-none"
                  style={{ fontFamily: 'var(--font-jost, sans-serif)', letterSpacing: '-0.02em' }}>
                  {item.price.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
                </span>
              </div>
              {hasDiscount && (
                <div className="flex items-baseline gap-0.5 opacity-45 line-through" style={{ fontFamily: 'var(--font-jost, sans-serif)' }}>
                  <span className="text-[10px] font-medium text-gray-400 leading-none">GHS</span>
                  <span className="text-sm font-medium text-gray-400 tabular-nums leading-none">
                    {item.compare_price!.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex flex-col gap-2">
          {showSizePicker && hasSizes && !hasBoth ? (
            <div className="flex flex-col gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Select Size:</span>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizePicker(false); }} className="p-1 rounded-full text-gray-400 hover:text-[#C8102E]"><X size={12} strokeWidth={2.5} /></button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {item.sizes!.map((size) => (
                  <button key={size} onClick={(e) => handleSizeSelect(size, e)} className="flex-shrink-0 min-w-[36px] h-8 px-3 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold hover:border-[#C8102E] hover:text-[#C8102E] transition-all shadow-sm">
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : showColorPicker && hasColors && !hasBoth ? (
            <div className="flex flex-col gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Select Colour:</span>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowColorPicker(false); }} className="p-1 rounded-full text-gray-400 hover:text-[#C8102E]"><X size={12} strokeWidth={2.5} /></button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {item.colors!.map((c) => {
                  const key = Object.keys(COLOR_MAP).find(k => k.toLowerCase() === c.toLowerCase());
                  const hex = key ? COLOR_MAP[key] : null;
                  return hex ? (
                    <button key={c} onClick={(e) => handleColorSelect(c, e)} aria-label={c} title={c} className="flex-shrink-0 w-8 h-8 rounded-full ring-1 ring-gray-200 hover:ring-gray-400 active:scale-95 transition-all shadow-sm" style={{ backgroundColor: hex }} />
                  ) : (
                    <button key={c} onClick={(e) => handleColorSelect(c, e)} className="flex-shrink-0 h-8 px-3 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold hover:border-[#C8102E] hover:text-[#C8102E] transition-all shadow-sm">{c}</button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleMove} disabled={!item.in_stock}
                className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all duration-300 active:scale-[0.97] ${
                  moved ? 'bg-emerald-500 text-white'
                  : item.in_stock ? 'bg-[#1A0A0A] text-white hover:bg-[#C8102E]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'var(--font-jost, sans-serif)' }}>
                {moved ? <><span>✓</span><span>Moved!</span></> : !hasBoth && !hasSizes && !hasColors ? <><ShoppingBag size={12} strokeWidth={2.5} /><span>Move to Bag</span></> : <span>{moveLabel}</span>}
              </button>
              <a href={quickProductOrderLink(item.name, item.price, item.slug)}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-10 flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-xl transition-all flex-shrink-0">
                <WhatsAppIcon size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const router = useRouter();
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);
  const addToCart = useCartStore((s) => s.addItem);
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function buildCartItem(it: WishlistItem) {
    return {
      id: it.id, slug: it.slug, name: it.name, price: it.price,
      images: [it.image], category: it.category, in_stock: it.in_stock,
      tag: it.tag ?? null, featured: false, description: null,
      details: null, sizes: null, created_at: '',
    } as Parameters<typeof addToCart>[0];
  }

  function handleMoveToCart(it: WishlistItem, size?: string, color?: string) {
    addToCart(buildCartItem(it), 1, size, color);
    remove(it.id);
    toast.success(size ? `Added size ${size} to bag` : color ? `Added ${color} to bag` : 'Moved to bag');
    window.dispatchEvent(new Event('cart:open'));
  }

  function handleGoToProduct(slug: string) {
    router.push(`/products/${slug}`);
  }

  function moveAllToCart() {
    const canAdd = items.filter((i) => i.in_stock && !needsChoice(i));
    const needsSelection = items.filter((i) => i.in_stock && needsChoice(i));

    if (canAdd.length === 0 && needsSelection.length === 0) return;

    // Add the ones that don't need a choice
    canAdd.forEach((it) => { addToCart(buildCartItem(it), 1); remove(it.id); });

    if (canAdd.length > 0 && needsSelection.length === 0) {
      // All added cleanly
      window.dispatchEvent(new Event('cart:open'));
      toast.success(`${canAdd.length} item${canAdd.length > 1 ? 's' : ''} added to bag ✦`);
    } else if (canAdd.length > 0 && needsSelection.length > 0) {
      // Some added, some need selection
      window.dispatchEvent(new Event('cart:open'));
      setTimeout(() => {
        toast.success(`${canAdd.length} added. ${needsSelection.length} still need a size — tap to select.`);
      }, 400);
    } else {
      // Nothing could be added — all need selection
      toast.error(`All items need a size or colour — tap each one to select.`);
    }
  }

  // Skeleton
  if (!mounted) {
    return (
      <div className="min-h-screen pt-20 lg:pt-28 pb-24" style={{ background: '#FAF7F2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-48 rounded-2xl animate-pulse mb-2" style={{ background: '#E8DDD5' }} />
          <div className="h-14 w-2/3 rounded-2xl animate-pulse mb-8" style={{ background: '#E8DDD5' }} />
          {/* Mobile skeleton: horizontal cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: '#E8DDD5' }} />
            ))}
          </div>
          {/* Desktop skeleton: grid */}
          <div className="hidden sm:grid grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#E8DDD5' }}>
                <div className="aspect-[3/4] animate-pulse" style={{ background: '#DDD4C8' }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded animate-pulse w-3/4" style={{ background: '#DDD4C8' }} />
                  <div className="h-8 rounded-xl animate-pulse mt-2" style={{ background: '#DDD4C8' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 lg:pt-28 pb-24 flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EDE2 50%, #FAF7F2 100%)' }}>
        <div className="text-center max-w-md w-full">
          <div className="relative inline-flex mb-10">
            <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              style={{ background: 'linear-gradient(135deg, #C8102E, #7B1818)', boxShadow: '0 24px 48px rgba(200,16,46,0.3)' }}>
              <Heart size={52} strokeWidth={1.5} className="text-white" />
            </div>
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
              <Sparkles size={20} className="text-gray-900" />
            </div>
            <div className="absolute -bottom-2 -left-3 w-8 h-8 rounded-xl shadow-lg animate-pulse" style={{ background: '#E8A0A8' }} />
          </div>

          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-[#C8102E] mb-4">Your Wishlist</p>
          <h1 className="text-5xl sm:text-6xl text-gray-900 leading-none mb-5"
            style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontWeight: 700 }}>
            Save what you <em className="text-[#C8102E]">love.</em>
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-10">
            Tap the heart on any piece to save it here. Build your dream collection, one favorite at a time.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/products"
              className="flex items-center justify-center gap-2 text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-2xl active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #1A0A0A, #C8102E)', boxShadow: '0 12px 32px rgba(200,16,46,0.25)' }}>
              Browse Products <ArrowRight size={14} />
            </Link>
            <Link href="/"
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all">
              Back to Home
            </Link>
          </div>

          <div className="mt-10 inline-flex items-center gap-2 bg-white border border-[#C8102E]/15 rounded-full px-4 py-2"
            style={{ boxShadow: '0 2px 12px rgba(200,16,46,0.07)' }}>
            <Heart size={11} className="text-[#C8102E] fill-[#C8102E]" />
            <p className="text-[11px] text-gray-500"><span className="font-bold">Tip:</span> Tap ♡ on any product card.</p>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = items.reduce((sum, i) => sum + i.price, 0);
  const inStockItems = items.filter((i) => i.in_stock);

  return (
    // Warm cream background — luxury, not generic gray
    <div className="min-h-screen pb-48 sm:pb-24" style={{ background: '#FAF7F2' }}>

      {/* ── Editorial header with warm accent bar ── */}
      <div className="pt-20 lg:pt-28 mb-0"
        style={{ background: 'linear-gradient(to bottom, #F0E8DF, #FAF7F2)', borderBottom: '1px solid rgba(200,16,46,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-7">
          <p className="text-[10px] font-black tracking-[0.35em] uppercase text-[#C8102E] mb-3">Your Saved Pieces</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-none"
              style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontWeight: 700 }}>
              Wishlist <em className="text-[#C8102E]">({items.length})</em>
            </h1>
            <button onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all">
              <Trash2 size={13} /> Clear all
            </button>
          </div>

          {/* Stats — inline horizontal, no boxes */}
          <div className="flex items-center gap-0 mt-6 flex-wrap">
            {[
              { label: 'Saved', value: items.length, unit: items.length === 1 ? 'piece' : 'pieces' },
              { label: 'In Stock', value: inStockItems.length, unit: 'available' },
              { label: 'Total Value', value: formatPrice(totalValue), unit: 'estimated', raw: true },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center">
                {i > 0 && <span className="w-px h-8 mx-4 sm:mx-6" style={{ background: 'rgba(200,16,46,0.15)' }} />}
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5">{s.label}</p>
                  <p className="text-2xl sm:text-3xl text-[#C8102E] leading-none"
                    style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontWeight: 700 }}>
                    {s.raw ? s.value : s.value}
                    {!s.raw && <span className="text-sm font-normal text-gray-400 ml-1.5">{s.unit}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">

        {/* Action banner — only shown on tablet+ (mobile has sticky bottom bar) */}
        {inStockItems.length > 0 && (
          <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap rounded-2xl p-5 sm:p-6 mb-8"
            style={{ background: 'linear-gradient(135deg, #C8102E 0%, #7B1818 100%)', boxShadow: '0 12px 32px rgba(200,16,46,0.25)' }}>
            <div>
              <p className="text-amber-400 text-[10px] font-black tracking-wider uppercase mb-1">Ready to order?</p>
              <p className="text-white text-lg font-black">Move all available pieces to your bag.</p>
            </div>
            <button onClick={moveAllToCart}
              className="inline-flex items-center gap-2 bg-white text-[#C8102E] font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-amber-400 hover:text-gray-900 active:scale-95 transition-all shadow-lg whitespace-nowrap">
              <ShoppingBag size={14} strokeWidth={2.5} />
              Add all ({inStockItems.length})
            </button>
          </div>
        )}

        {/* Grid — single col (horizontal) on mobile, 2–4 col portrait on larger */}
        <div className="flex flex-col gap-3 sm:hidden">
          {items.map((it, idx) => (
            <WishlistCard key={it.id} item={it} index={idx} onRemove={remove} onMoveToCart={handleMoveToCart} onGoToProduct={handleGoToProduct} />
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {items.map((it, idx) => (
            <WishlistCard key={it.id} item={it} index={idx} onRemove={remove} onMoveToCart={handleMoveToCart} onGoToProduct={handleGoToProduct} />
          ))}
        </div>

        {/* Browse more */}
        <div className="mt-12 text-center">
          <Link href="/products"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C8102E] hover:text-[#7B1818] transition-colors">
            Browse more pieces <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Sticky bottom bar — mobile only, when items are in stock ── */}
      {inStockItems.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-40 sm:hidden px-4 pt-3 pb-3"
          style={{
            background: 'linear-gradient(to top, #FAF7F2 80%, transparent)',
          }}>
          <button onClick={moveAllToCart}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-black uppercase tracking-wider text-white active:scale-[0.98] transition-all"
            style={{ background: 'linear-gradient(135deg, #C8102E, #7B1818)', boxShadow: '0 8px 24px rgba(200,16,46,0.35)' }}>
            <ShoppingBag size={16} strokeWidth={2.5} />
            Move all to bag · {inStockItems.length} {inStockItems.length === 1 ? 'item' : 'items'}
          </button>
        </div>
      )}

      {/* Clear confirm modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-4"
          onClick={() => setConfirmClear(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-7 shadow-2xl"
            style={{ paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom, 0px))' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-2">Clear all favorites?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will remove all <strong>{items.length}</strong> {items.length === 1 ? 'piece' : 'pieces'} from your wishlist.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClear(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-bold text-sm py-3.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => { clear(); setConfirmClear(false); }}
                className="flex-1 bg-red-500 text-white font-black text-sm py-3.5 rounded-xl hover:bg-red-600 active:scale-95 transition-all">
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
