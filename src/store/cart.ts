'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface AppliedDiscount {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  amount: number;
  min_order: number | null;
  description: string | null;
  expires_at: string | null; // stored so we can auto-clear on rehydration
}

interface CartStore {
  items: CartItem[];
  discount: AppliedDiscount | null;
  // ✨ FIXED: Added color as the 4th optional parameter
  addItem: (product: Product, qty: number, size?: string, color?: string) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  applyDiscount: (d: AppliedDiscount) => void;
  removeDiscount: () => void;
  subtotal: () => number;
  total: () => number;
  itemCount: () => number;
}

// 🛠️ THE MAGIC ENGINE: Automatically recalculates the discount every time the cart changes!
function recalculateDiscount(items: CartItem[], discount: AppliedDiscount | null): AppliedDiscount | null {
  if (!discount) return null;
  if (items.length === 0) return null; // Cart is empty, drop discount

  const currentSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // If they removed items and dropped below the required minimum, auto-remove the code!
  if (discount.min_order && currentSubtotal < discount.min_order) {
    return null;
  }

  // Recalculate the mathematical amount (crucial for percentage discounts)
  const newAmount = discount.type === 'percent'
    ? Math.round((currentSubtotal * discount.value) / 100)
    : Math.min(discount.value, currentSubtotal);

  return { ...discount, amount: newAmount };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discount: null,

      // ✨ FIXED: Added color
      addItem: (product, qty, size?, color?) => {
        
        // ✨ FIXED: Make sure a "Medium Black" and "Medium White" don't merge!
        let key = product.id;
        if (size) key += `-${size}`;
        if (color) key += `-${color}`;

        const existing = get().items.find((i) => i.id === key);
        
        let newItems;
        if (existing) {
          newItems = get().items.map((i) =>
            i.id === key ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          newItems = [
            ...get().items,
            {
              id: key,
              name: product.name,
              price: product.price,
              image: product.images?.[0] ?? '',
              quantity: qty,
              slug: product.slug,
              size,
              color, // ✨ Added color to the CartItem object
            },
          ];
        }

        // Run the recalculation engine
        set({ 
          items: newItems, 
          discount: recalculateDiscount(newItems, get().discount) 
        });
      },

      removeItem: (id) => {
        const newItems = get().items.filter((i) => i.id !== id);
        set({ 
          items: newItems, 
          discount: recalculateDiscount(newItems, get().discount) 
        });
      },

      updateQty: (id, qty) => {
        if (qty < 1) {
          get().removeItem(id);
          return;
        }
        const newItems = get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
        set({ 
          items: newItems, 
          discount: recalculateDiscount(newItems, get().discount) 
        });
      },

      clearCart: () => set({ items: [], discount: null }),

      applyDiscount: (d) => set({ discount: d }),
      removeDiscount: () => set({ discount: null }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      total: () => {
        const sub = get().subtotal();
        const d = get().discount;
        if (!d) return sub;
        return Math.max(0, sub - d.amount);
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'lsb-cart',
      // Auto-clear discount if it has expired since the cart was last saved
      onRehydrateStorage: () => (state) => {
        if (state?.discount?.expires_at) {
          if (new Date(state.discount.expires_at) < new Date()) {
            state.discount = null;
          }
        }
      },
    }
  )
);
