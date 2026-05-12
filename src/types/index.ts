export type Category =
  | 'heels'
  | 'flats'
  | 'handbags'
  | 'tote'
  | 'crossbody'
  | 'mini';
export type ProductTag = 'New' | 'Bestseller' | 'Limited' | 'Sale' | '';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  description: string | null;
  details: string[] | null;
  images: string[];
  tag: ProductTag | null;
  featured: boolean;
  in_stock: boolean;
  sizes?: string[] | null;
  colors?: string[] | null; // ✨ Added colors
  material?: string | null; // ✨ Added material
  stock_count?: number | null;
  compare_price?: number | null;
  created_at: string;
}

export type DiscountType = 'percent' | 'fixed';

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  active: boolean;
  description: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  size?: string;
  color?: string; // ✨ Added color
}
