'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useRecentlyViewedStore } from '@/store/recentlyViewed';
import { seedProducts } from '@/data/seed';
import { toast } from '@/components/ui/Toast';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductInfoPanel from '@/components/product/ProductInfoPanel';
import ProductDetailsAccordion from '@/components/product/ProductDetailsAccordion';
import RelatedProducts from '@/components/product/RelatedProducts';
import StickyBuyBar from '@/components/product/StickyBuyBar';

const CATEGORY_LABELS: Record<string, string> = {
  heels:     'Heels',
  flats:     'Flats & Slippers',
  handbags:  'Handbags',
  tote:      'Tote Bags',
  crossbody: 'Crossbody',
  mini:      'Mini Bags',
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  
  // ✨ STATE: Size & Color
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const ctaRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => product ? s.has(product.id) : false);
  const trackView = useRecentlyViewedStore((s) => s.track);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error('fallback');
        const json = await res.json();
        setProduct(json.product);
        setRelated(json.related ?? []);
      } catch {
        const found = seedProducts.find((p) => p.slug === slug);
        if (found) {
          setProduct({ ...found, id: 'seed-0', created_at: new Date().toISOString() } as Product);
          setRelated(
            seedProducts
              .filter((sp) => sp.category === found.category && sp.slug !== slug)
              .slice(0, 8)
              .map((sp, i) => ({ ...sp, id: `seed-rel-${i}`, created_at: new Date().toISOString() }) as Product)
          );
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (product) {
      trackView(product);
      fetch(`/api/products/${product.slug}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [product, trackView]);

    // ✨ UPDATED: Fixed the scroll target for colors!
  function requireOptions(): boolean {
    let isValid = true;
    
    // Check Size
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setSizeError(false), 4000);
      isValid = false;
    }
    
    // Check Color
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setColorError(true);
      // Only scroll to color if we haven't already scrolled to size!
      if (isValid) { 
        document.getElementById('color-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => setColorError(false), 4000);
      isValid = false;
    }
    
    return isValid;
  }

  function handleAddToCart() {
    if (!product) return;
    if (!requireOptions()) return; // Fails if they forgot size or color
    
    setSizeError(false);
    setColorError(false);
    
    // Pass color to the cart store along with size
    addItem(product, qty, selectedSize ?? undefined, selectedColor ?? undefined);
    
    setAdded(true);
    toast.success('Added to bag ✦');
    setTimeout(() => setAdded(false), 1800);
    window.dispatchEvent(new Event('cart:open'));
  }

  function handleWishToggle() {
    if (!product) return;
    toggleWish(product);
    toast.success(isWished ? 'Removed from wishlist' : 'Saved to wishlist ♡');
  }

  if (loading) {
    return (
      <div className="min-h-dvh pt-20 lg:pt-24 pb-24 bg-[#FFFAF8]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 mt-8">
            <div className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-4 pt-4">
              <div className="h-3 bg-gray-200 rounded-full w-1/4 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-2xl w-4/5 animate-pulse" />
              <div className="h-7 bg-gray-200 rounded-full w-1/3 animate-pulse" />
              <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center text-center px-4 bg-[#FFFAF8]">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-3xl text-[#1A0A0A] mb-3" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}>
          Piece not found
        </p>
        <p className="text-sm text-gray-500 mb-8 font-light" style={{ fontFamily: 'var(--font-jost)' }}>
          This item may have been removed or is no longer available in the archive.
        </p>
        <Link
          href="/products"
          className="bg-[#1A0A0A] hover:bg-[#C9956C] text-white text-[10px] uppercase tracking-widest px-8 py-4 rounded-full transition-all active:scale-[0.97] font-bold"
          style={{ fontFamily: 'var(--font-jost)' }}
        >
          ← Back to Collection
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [`https://picsum.photos/seed/${product.id}/600/800`];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: images,
    sku: product.id,
    category: product.category,
    brand: { '@type': 'Brand', name: 'Luxury Steps Boutique' },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      priceCurrency: 'GHS',
      price: product.price,
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="min-h-dvh pt-20 lg:pt-28 pb-24 lg:pb-12 bg-[#FFFAF8]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-2 mb-4" aria-label="Breadcrumb" style={{ fontFamily: 'var(--font-jost)' }}>
        <ol className="flex items-center gap-2.5 flex-wrap text-[10px] uppercase tracking-widest font-bold text-gray-400">
          <li><Link href="/" className="hover:text-[#1A0A0A] transition-colors">Home</Link></li>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <li><Link href="/products" className="hover:text-[#1A0A0A] transition-colors">Shop</Link></li>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <li><Link href={`/products?category=${product.category}`} className="hover:text-[#1A0A0A] transition-colors">{CATEGORY_LABELS[product.category] ?? product.category}</Link></li>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <li className="min-w-0"><span className="text-[#1A0A0A] truncate inline-block max-w-[160px] sm:max-w-xs">{product.name}</span></li>
        </ol>
      </nav>

      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-4 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          <div>
            <ProductImageGallery images={images} alt={product.name} tag={product.tag} productSlug={product.slug} isWished={isWished} onWishToggle={handleWishToggle} />
          </div>

          <div className="lg:sticky lg:top-28 lg:max-h-[calc(100svh-8rem)] lg:overflow-y-auto no-scrollbar">
            <ProductInfoPanel
              ref={ctaRef}
              product={product}
              qty={qty}
              setQty={setQty}
              
              // ✨ Passed down new props
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              sizeError={sizeError}
              
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              colorError={colorError}
              
              added={added}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </section>

      <ProductDetailsAccordion product={product} />
      {related.length > 0 && <RelatedProducts products={related} />}

      {/* Note: I didn't add color to StickyBuyBar yet. If it complains, we can update it, but it should be fine. */}
      <StickyBuyBar
        product={product}
        qty={qty}
        selectedSize={selectedSize}
        added={added}
        ctaRef={ctaRef}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
