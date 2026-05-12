import { Metadata } from 'next';
import ProductClient from './ProductClient';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${SITE_URL}/api/products/${params.slug}`);
    if (!res.ok) throw new Error('Product not found');
    
    const { product } = await res.json();
    if (!product) return {};

    return {
      title: `${product.name} | Luxury Steps Boutique`,
      description: product.description || `Shop the ${product.name} at Luxury Steps Boutique.`,
      openGraph: {
        title: `${product.name} | Luxury Steps Boutique`,
        description: product.description || `Shop the ${product.name} at Luxury Steps Boutique.`,
        url: `${SITE_URL}/products/${product.slug}`,
        siteName: 'Luxury Steps Boutique',
        // og:image is handled by opengraph-image.tsx (1200×630 landscape card)
        // — do NOT add images here or it will conflict/duplicate the meta tag.
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} | Luxury Steps Boutique`,
        description: product.description || `Shop the ${product.name} at Luxury Steps Boutique.`,
      },
    };
  } catch { // ✨ FIXED: Removed the unused 'error' variable!
    return {
      title: 'Product | Luxury Steps Boutique',
    };
  }
}

export default function ProductServerPage() {
  return <ProductClient />;
}
