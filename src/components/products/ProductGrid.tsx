import { Product } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  columns?: 'two' | 'three' | 'four';
}

const GRID_CLASSES = {
  two: 'grid-cols-2',
  three: 'grid-cols-2 lg:grid-cols-3',
  four: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

function ProductSkeleton() {
  return (
    <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-2 rounded-full w-1/4" />
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-3 rounded w-1/3" />
        <div className="pt-3 border-t border-border">
          <div className="skeleton h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = 'four' }: { count?: number; columns?: 'two' | 'three' | 'four' }) {
  return (
    <div className={`grid ${GRID_CLASSES[columns]} gap-4 sm:gap-5 lg:gap-6`}>
      {Array.from({ length: count }).map((_, i) => <ProductSkeleton key={i} />)}
    </div>
  );
}

export default function ProductGrid({ products, columns = 'four' }: Props) {
  if (products.length === 0) {
    return (
      <div className="text-center py-24 bg-surface rounded-2xl">
        <p className="font-display text-3xl text-dark mb-3">Nothing here yet</p>
        <p className="font-body text-sm text-muted">Check back soon. New pieces are on the way.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${GRID_CLASSES[columns]} gap-4 sm:gap-5 lg:gap-6`}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
