export const dynamic = 'force-dynamic';
import { Product } from '@/types';
import ProductsClient from './ProductsClient';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${SITE_URL}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

interface Props { searchParams: { category?: string } }

export default async function ProductsPage({ searchParams }: Props) {
  const products = await getAllProducts();
  const initialCategory = searchParams.category ?? 'all';
  return <ProductsClient initialProducts={products} initialCategory={initialCategory} />;
}
