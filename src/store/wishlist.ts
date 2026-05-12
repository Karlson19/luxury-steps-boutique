import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  in_stock: boolean;
  tag?: string | null;
  addedAt: number;
  sizes?: string[] | null;
  colors?: string[] | null;
}

interface WishlistStore {
  items: WishlistItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  toggle: (product: Product) => boolean;
  has: (id: string) => boolean;
  clear: () => void;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) => {
        if (get().items.some((i) => i.id === product.id)) return;
        const item: WishlistItem = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images?.[0] ?? '',
          category: product.category,
          in_stock: product.in_stock,
          tag: product.tag,
          addedAt: Date.now(),
          sizes: product.sizes ?? null,
          colors: product.colors ?? null,
        };
        set((s) => ({ items: [item, ...s.items] }));
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggle: (product) => {
        const exists = get().items.some((i) => i.id === product.id);
        if (exists) {
          get().remove(product.id);
          return false;
        }
        get().add(product);
        return true;
      },
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
      count: () => get().items.length,
    }),
    { name: 'lsb-wishlist' }
  )
);
