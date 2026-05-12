'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { useRecentlyViewedStore } from '@/store/recentlyViewed';
import { formatPrice } from '@/lib/utils';

interface Props {
  excludeId?: string;
  variant?: 'detail' | 'home';
}

export default function RecentlyViewed({ excludeId, variant = 'detail' }: Props) {
  const items = useRecentlyViewedStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const filtered = items.filter((i) => i.id !== excludeId).slice(0, 6);
  if (filtered.length === 0) return null;

  return (
    <section className={`${variant === 'detail' ? 'mb-16' : ''}`}>
      <div className="flex items-end justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#7B1818] flex items-center justify-center shadow-md shadow-[#C8102E]/20">
            <Clock size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#C8102E] mb-0.5">Continue browsing</p>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">Recently Viewed</h3>
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group flex-shrink-0 w-32 sm:w-auto bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              {p.image ? (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="160px"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : null}
              {!p.in_stock && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-900 bg-white px-2 py-1 rounded-full shadow">
                    Sold Out
                  </span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-bold text-gray-900 truncate mb-1">{p.name}</p>
              <p className="text-xs font-black text-gray-700">{formatPrice(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
