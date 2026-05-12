'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/types';
import ProductForm from '@/components/admin/ProductForm';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error();
        const json = await res.json();
        const found = (json.data as Product[]).find((p) => p.id === id);
        setProduct(found ?? null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
        <div>
          <p className="font-display text-2xl text-dark mb-2">Product not found</p>
          <p className="font-body text-sm text-muted">This product may have been deleted.</p>
        </div>
      </div>
    );
  }

  return <ProductForm product={product} mode="edit" />;
}
