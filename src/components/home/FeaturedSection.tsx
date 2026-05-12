'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';

const CATEGORIES = ['All', 'Heels', 'Flats', 'Handbags', 'Tote', 'Crossbody', 'Mini'];

const CATEGORY_MAP: Record<string, string> = {
  Heels: 'heels',
  Flats: 'flats',
  Handbags: 'handbags',
  Tote: 'tote',
  Crossbody: 'crossbody',
  Mini: 'mini',
};

interface Props {
  products: Product[];
}

export default function FeaturedSection({ products }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter(p => p.category === CATEGORY_MAP[activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-20 pt-6">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1 py-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-[#C8102E] text-white shadow-md shadow-[#C8102E]/30'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-bold text-gray-900 text-lg">
          {activeCategory === 'All' ? 'Featured Pieces' : activeCategory}
          <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
        </h2>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#C8102E] hover:text-[#7B1818] transition-colors"
        >
          View All <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
