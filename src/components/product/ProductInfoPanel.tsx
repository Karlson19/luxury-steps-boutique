'use client';

import { useState, forwardRef } from 'react';
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  Truck,
  MapPin,
  Wallet,
  QrCode,
  Share,
} from 'lucide-react';
import { Product } from '@/types';
import { toast } from '@/components/ui/Toast';
import { sortSizes } from '@/lib/utils';
import SizeGuideModal from './SizeGuideModal';
import QRCodeModal from '../admin/QRCodeModal';

// ✨ NEW: Helper to capitalize the product name
function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Curated swatch values for fashion-named colors. Anything not in this map
// falls back to the CSS named colour (e.g. "violet", "indigo", "salmon",
// "khaki" — browsers recognise ~140 names). If that fails too, the helper
// returns a soft grey so the swatch is still rendered as a circle.
const COLOR_MAP: Record<string, string> = {
  'Black':       '#000000',
  'White':       '#FFFFFF',
  'Red':         '#DC2626',
  'Scarlet':     '#C8102E',
  'Crimson':     '#9B1B30',
  'Burgundy':    '#7B1818',
  'Maroon':      '#5C0F1B',
  'Wine':        '#5E2129',
  'Pink':        '#EC4899',
  'Hot Pink':    '#F472B6',
  'Blush':       '#FFC0CB',
  'Rose':        '#E11D48',
  'Rose Gold':   '#B76E79',
  'Coral':       '#FF7F50',
  'Peach':       '#FFDAB9',
  'Orange':      '#F97316',
  'Mustard':     '#E0A800',
  'Yellow':      '#EAB308',
  'Gold':        '#D4AF37',
  'Champagne':   '#F7E7CE',
  'Cream':       '#FFFDD0',
  'Ivory':       '#FFFAF0',
  'Beige':       '#F5F5DC',
  'Nude':        '#E3BC9A',
  'Tan':         '#D2B48C',
  'Camel':       '#C19A6B',
  'Brown':       '#78350F',
  'Chocolate':   '#5C3317',
  'Mocha':       '#7B5E51',
  'Khaki':       '#C3B091',
  'Olive':       '#3F6212',
  'Green':       '#16A34A',
  'Emerald':     '#065F46',
  'Sage':        '#9CAF88',
  'Mint':        '#3EB489',
  'Forest':      '#1E4D2B',
  'Teal':        '#0D9488',
  'Turquoise':   '#30D5C8',
  'Cyan':        '#0891B2',
  'Sky Blue':    '#7DD3FC',
  'Baby Blue':   '#BFDBFE',
  'Blue':        '#2563EB',
  'Royal Blue':  '#1D4ED8',
  'Navy':        '#1E3A8A',
  'Navy Blue':   '#1E3A8A',
  'Cobalt':      '#0047AB',
  'Indigo':      '#4338CA',
  'Denim':       '#1F4E79',
  'Purple':      '#9333EA',
  'Plum':        '#8B3A62',
  'Violet':      '#7C3AED',
  'Lavender':    '#D8B4E2',
  'Lilac':       '#C8A2C8',
  'Magenta':     '#C026D3',
  'Fuchsia':     '#D946EF',
  'Silver':      '#C0C0C0',
  'Grey':        '#9CA3AF',
  'Gray':        '#9CA3AF',
  'Charcoal':    '#374151',
  'Slate':       '#475569',
  'Stone':       '#A8A29E',
  'Taupe':       '#8B7E74',
  'Bronze':      '#A97142',
  'Copper':      '#B87333',
};

function resolveColor(name: string): { hex: string; known: boolean } {
  const key = Object.keys(COLOR_MAP).find((k) => k.toLowerCase() === name.toLowerCase());
  if (key) return { hex: COLOR_MAP[key], known: true };
  // Trust the browser to resolve CSS named colours (violet, salmon, khaki, etc.)
  // — invalid names will just render with the page background showing through,
  // which we mitigate by always rendering a visible ring around the swatch.
  return { hex: name.toLowerCase().replace(/\s+/g, ''), known: false };
}

const CATEGORY_BADGES: Record<string, string> = {
  heels:     'bg-[#C8102E] text-white',
  flats:     'bg-[#C9956C] text-white',
  handbags:  'bg-[#7B1818] text-white',
  tote:      'bg-[#A87850] text-white',
  crossbody: 'bg-[#E63950] text-white',
  mini:      'bg-[#DCB089] text-white',
};

const CATEGORY_LABELS: Record<string, string> = {
  heels:     'Heels',
  flats:     'Flats & Slippers',
  handbags:  'Handbags',
  tote:      'Tote Bags',
  crossbody: 'Crossbody',
  mini:      'Mini Bags',
};

interface Props {
  product: Product;
  qty: number;
  setQty: (n: number) => void;
  selectedSize: string | null;
  setSelectedSize: (s: string | null) => void;
  sizeError: boolean;
  selectedColor: string | null;
  setSelectedColor: (c: string | null) => void;
  colorError: boolean;
  added: boolean;
  onAddToCart: () => void;
}

const ProductInfoPanel = forwardRef<HTMLDivElement, Props>(function ProductInfoPanel(
  {
    product,
    qty,
    setQty,
    selectedSize,
    setSelectedSize,
    sizeError,
    selectedColor,
    setSelectedColor,
    colorError,
    added,
    onAddToCart,
  },
  ctaRef,
) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const hasSizes = !!(product.sizes && product.sizes.length > 0);
  const hasColors = !!(product.colors && product.colors.length > 0);

  const compare =
    product.compare_price && product.compare_price > product.price
      ? product.compare_price
      : null;
  const discountPct = compare
    ? Math.round(((compare - product.price) / compare) * 100)
    : null;

  const description = product.description ?? '';
  const isLongDesc = description.length > 180;
  const visibleDesc =
    isLongDesc && !descExpanded
      ? description.slice(0, 180).trim() + '…'
      : description;

  const stockCount = product.stock_count;
  const hasStockCount = typeof stockCount === 'number' && stockCount > 0;
  const lowStock = hasStockCount && (stockCount as number) <= 3;

  const productUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/products/${product.slug}`
      : `https://luxurystepsboutique.vercel.app/products/${product.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Luxury Steps Boutique | ${toTitleCase(product.name)}`,
          text: `Check out this ${toTitleCase(product.name)} on Luxury Steps Boutique.`,
          url: productUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(productUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="w-full animate-info-slide" style={{ fontFamily: 'var(--font-jost)' }}>
      <style jsx>{`
        @keyframes info-slide {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (min-width: 1024px) {
          .animate-info-slide { animation: info-slide 350ms ease-out both; }
        }
      `}</style>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span
          className={`rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.2em] ${CATEGORY_BADGES[product.category] ?? 'bg-[#1A0A0A] text-white'}`}
          style={{ fontWeight: 600 }}
        >
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          Ref. {product.id.slice(0, 8)}
        </span>
      </div>

      {/* ✨ UPDATED: Product Name is now Title Cased */}
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl text-[#1A0A0A] mb-4"
        style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em' }}
      >
        {toTitleCase(product.name)}
      </h1>

      {/* ✨ UPDATED: Premium split-style Price Block */}
      <div className="flex items-end gap-3 mb-6 flex-wrap">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-semibold text-[#C8102E]/70 uppercase tracking-widest" style={{ fontFamily: 'var(--font-jost)' }}>
            GHS
          </span>
          <span className="text-3xl sm:text-4xl text-[#C8102E] tabular-nums leading-none" style={{ fontFamily: 'var(--font-jost)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {product.price.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
          </span>
        </div>
        
        {compare && (
          <>
            <div className="flex items-baseline gap-0.5 line-through opacity-50 mb-1">
              <span className="text-xs font-medium text-gray-500" style={{ fontFamily: 'var(--font-jost)' }}>GHS</span>
              <span className="text-lg font-medium text-gray-500 tabular-nums" style={{ fontFamily: 'var(--font-jost)' }}>
                {compare.toLocaleString('en-GH', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <span className="rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase bg-[#C9956C]/10 text-[#C9956C] mb-1.5">
              −{discountPct}% OFF
            </span>
          </>
        )}
      </div>

      {description && (
        <div className="mb-8">
          <p className="text-sm text-gray-600 leading-[1.8] font-light">
            {visibleDesc}
          </p>
          {isLongDesc && (
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-2 text-[11px] uppercase tracking-widest text-[#C9956C] hover:text-[#1A0A0A] font-bold transition-colors"
            >
              {descExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* VISUAL COLOR SELECTOR */}
      {hasColors && (
        <div id="color-selector" className={`mb-6 transition-all duration-300 ${colorError ? 'animate-pulse' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
              Color {selectedColor && <span className="text-[#1A0A0A] ml-1">: {selectedColor}</span>}
            </span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {product.colors!.map((c) => {
              const isActive = selectedColor === c;
              const { hex } = resolveColor(c);
              // Brightness check for swatches we know are very light
              // (white, cream, ivory, blush) — show the check in dark ink.
              const isVeryLight = /^#?(f{2,3}[a-f0-9]{0,4}|ivory|white|cream|blush)/i.test(hex);
              return (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  aria-label={`Select color ${c}`}
                  title={c}
                  className="group inline-flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <span
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'ring-2 ring-offset-2 ring-[#1A0A0A] shadow-md'
                        : 'ring-1 ring-gray-300 group-hover:ring-[#C9956C] group-hover:ring-2'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {isActive && (
                      <Check
                        className={`w-4 h-4 ${isVeryLight ? 'text-[#1A0A0A]' : 'text-white'}`}
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider leading-none transition-colors ${
                      isActive ? 'text-[#1A0A0A] font-bold' : 'text-gray-500 font-semibold'
                    }`}
                  >
                    {c}
                  </span>
                </button>
              );
            })}
          </div>
          {colorError && (
            <p className="text-[11px] text-[#B91C3A] mt-2 font-medium">
              Please select a color to continue
            </p>
          )}
        </div>
      )}

      {/* SIZE SELECTOR */}
      {hasSizes && (
        <div id="size-selector" className={`mb-8 transition-all duration-300 ${sizeError ? 'animate-pulse' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
              Size {selectedSize && <span className="text-[#1A0A0A] ml-1">: {selectedSize}</span>}
            </span>
            <button
              onClick={() => setSizeGuideOpen(true)}
              className="text-[10px] uppercase tracking-widest text-[#C9956C] hover:text-[#1A0A0A] font-bold transition-colors"
            >
              Size Guide →
            </button>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {sortSizes(product.sizes!).map((s) => {
              const isActive = selectedSize === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-[44px] h-[44px] px-3 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'bg-[#1A0A0A] text-white border border-[#1A0A0A] shadow-xl'
                      : 'bg-transparent border border-gray-200 text-[#1A0A0A] hover:border-[#C9956C] hover:text-[#C9956C]'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {sizeError && (
            <p className="text-[11px] text-[#B91C3A] mt-3 font-medium">
              Please select a size to continue
            </p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center gap-5 mb-8">
        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
          Qty
        </span>
        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden h-11">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            className="w-11 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-30"
          >
            <Minus className="w-3.5 h-3.5 text-[#1A0A0A]" strokeWidth={2} />
          </button>
          <span className="w-10 text-center text-sm text-[#1A0A0A] tabular-nums font-medium">
            {qty}
          </span>
          <button
            onClick={() => setQty(qty + 1)}
            disabled={typeof stockCount === 'number' && stockCount > 0 && qty >= stockCount}
            className="w-11 h-full flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-30"
          >
            <Plus className="w-3.5 h-3.5 text-[#1A0A0A]" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          {product.in_stock ? (
            <>
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-50 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-600" />
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                In Stock
              </span>
              {hasStockCount && (
                <span
                  className={`text-[11px] ml-1 ${
                    lowStock ? 'text-[#C8102E] font-bold' : 'text-gray-500 font-medium'
                  }`}
                >
                  ·{' '}
                  {lowStock
                    ? `Only ${stockCount} left`
                    : `${stockCount} ${stockCount === 1 ? 'piece' : 'pieces'} available`}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
                Sold Out
              </span>
            </>
          )}
        </div>
      </div>

      {/* ─── CTA BLOCK ─── */}
      <div ref={ctaRef} className="flex flex-col items-center gap-3 mb-8 w-full">
        {product.in_stock ? (
          <button
            onClick={onAddToCart}
            className={`w-full flex items-center justify-center gap-2.5 rounded-full py-4 sm:py-5 text-[11px] sm:text-xs uppercase tracking-[0.25em] transition-all duration-300 active:scale-[0.98] ${
              added
                ? 'bg-emerald-700 text-white shadow-xl shadow-emerald-700/20'
                : 'bg-[#1A0A0A] text-white hover:bg-[#C9956C] hover:shadow-xl hover:shadow-[#C9956C]/20'
            }`}
            style={{ fontWeight: 600 }}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2.5} />
                Added to Bag
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                Add to Bag
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="w-full rounded-full py-4 sm:py-5 bg-gray-100 text-gray-400 cursor-not-allowed text-[11px] uppercase tracking-[0.25em] font-bold"
          >
            Sold Out
          </button>
        )}

        <div className="flex items-center gap-3 w-full mt-1">
          <button
            onClick={handleShare}
            className="flex-1 border border-gray-200 py-3.5 rounded-full flex items-center justify-center gap-2 hover:border-[#1A0A0A] text-gray-500 hover:text-[#1A0A0A] transition-colors active:scale-95"
          >
            <Share size={14} strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Share Link</span>
          </button>
          
          <button
            onClick={() => setQrOpen(true)}
            className="flex-1 border border-gray-200 py-3.5 rounded-full flex items-center justify-center gap-2 hover:border-[#1A0A0A] text-gray-500 hover:text-[#1A0A0A] transition-colors active:scale-95"
          >
            <QrCode size={14} strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Show QR</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 py-6 border-t border-b border-gray-100 my-4">
        {[
          { Icon: MapPin, title: 'Pickup',   sub: 'KNUST & Ashaiman' },
          { Icon: Truck,  title: 'Delivery', sub: '1–3 days, Ghana-wide' },
          { Icon: Wallet, title: 'Pay',      sub: 'MOMO · Bank · Cash' },
        ].map(({ Icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center gap-1.5 text-center">
            <Icon className="w-4 h-4 text-[#C9956C]" strokeWidth={1.5} />
            <span className="text-[10px] text-[#1A0A0A] uppercase tracking-widest font-bold leading-none">
              {title}
            </span>
            <span className="text-[9px] text-gray-500 leading-tight px-1">
              {sub}
            </span>
          </div>
        ))}
      </div>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      {qrOpen && (
        <QRCodeModal
          url={productUrl}
          productName={product.name}
          productImage={product.images?.[0]}
          onClose={() => setQrOpen(false)}
        />
      )}
    </div>
  );
});

export default ProductInfoPanel;
