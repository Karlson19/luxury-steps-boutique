'use client';

import { useEffect, useState, RefObject } from 'react';
import Image from 'next/image';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

interface Props {
  product: Product;
  qty: number;
  selectedSize: string | null;
  added: boolean;
  ctaRef: RefObject<HTMLDivElement | null>;
  onAddToCart: () => void;
}

export default function StickyBuyBar({
  product,
  selectedSize,
  added,
  ctaRef,
  onAddToCart,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: '0px 0px -100px 0px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [ctaRef]);

  const image = product.images?.[0] ?? `https://picsum.photos/seed/${product.id}/120/120`;
  const sizeMissing = !!(product.sizes && product.sizes.length > 0 && !selectedSize);

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 rounded-t-2xl transition-transform duration-[400ms] ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        boxShadow: '0 -10px 40px rgba(0,0,0,0.08)',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
        fontFamily: 'var(--font-jost)',
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        
        {/* Image & Price Info */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <Image src={image} alt={product.name} fill sizes="44px" className="object-cover" />
          </div>
          <div>
            <p className="text-xl text-[#C8102E] leading-none" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700 }}>
              {formatPrice(product.price)}
            </p>
            {sizeMissing && (
              <p className="text-[9px] text-[#B91C3A] uppercase tracking-widest mt-1 font-bold">
                Pick a size
              </p>
            )}
          </div>
        </div>

        {/* 🛠️ FIXED: Massive, unmissable Add to Bag button */}
        <div className="flex-1">
          {product.in_stock ? (
            <button
              onClick={onAddToCart}
              className={`w-full rounded-full py-3.5 text-[11px] uppercase tracking-widest active:scale-[0.97] transition-all duration-300 font-bold ${
                added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#1A0A0A] text-white'
              }`}
            >
              {added ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Added ✓
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
                  Add to Bag
                </span>
              )}
            </button>
          ) : (
            <button disabled className="w-full rounded-full py-3.5 bg-gray-200 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              Sold Out
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
