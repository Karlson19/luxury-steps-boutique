'use client';

import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

interface Props {
  products: Product[];
}

export default function RelatedProducts({ products }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section
      className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 border-t border-bone relative"
      style={{ fontFamily: 'var(--font-jost)' }}
    >
      <div className="flex items-end justify-between mb-6 gap-4">
        <h2
          className="text-3xl text-ink italic"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}
        >
          You May Also Love
        </h2>
        <Link
          href="/products"
          className="text-xs text-burgundy uppercase tracking-wider hover:text-burgundy-light transition-colors flex-shrink-0"
          style={{ fontWeight: 500 }}
        >
          View All →
        </Link>
      </div>

      <div className="relative">
        <div
          className="-mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 overflow-x-auto scrollbar-hide flex gap-4 pb-4"
          style={{ scrollSnapType: 'x proximity' }}
        >
          {products.map((p, i) => (
            <div
              key={p.id}
              className="flex-shrink-0 w-[200px] sm:w-[230px] lg:w-[260px] animate-related-rise opacity-0"
              style={{
                scrollSnapAlign: 'start',
                animationDelay: `${i * 60}ms`,
              }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Edge fades — desktop only */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-champagne to-transparent pointer-events-none" />
        <div className="hidden lg:block absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-champagne to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes related-rise {
          from {
            transform: translateY(12px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-related-rise {
          animation: related-rise 400ms ease-out forwards;
        }
      `}</style>
    </section>
  );
}
