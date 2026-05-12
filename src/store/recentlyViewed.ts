import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface RecentItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  in_stock: boolean;
  tag?: string | null;
  viewedAt: number;
}

interface RecentlyViewedStore {
  items: RecentItem[];
  track: (product: Product) => void;
  clear: () => void;
}

const MAX_RECENT = 12;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      items: [],
      track: (product) => set((s) => {
        const filtered = s.items.filter((i) => i.id !== product.id);
        const item: RecentItem = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? '',
          category: product.category,
          in_stock: product.in_stock,
          tag: product.tag,
          viewedAt: Date.now(),
        };
        return { items: [item, ...filtered].slice(0, MAX_RECENT) };
      }),
      clear: () => set({ items: [] }),
    }),
    { name: 'lsb-recent' }
  )
);
