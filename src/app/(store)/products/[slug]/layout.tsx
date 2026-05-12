import { Metadata } from 'next';
import { getServiceClient } from '@/lib/supabase';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://luxurystepsboutique.vercel.app';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('products')
      .select('name, description, price')
      .eq('slug', params.slug)
      .single();

    if (!data) return {};

    const siteUrl = getSiteUrl();
    const productUrl = `${siteUrl}/products/${params.slug}`;
    const title = `${data.name} | Luxury Steps Boutique`;
    const description = data.description ?? `Hand-picked piece. GHS ${data.price.toLocaleString()}`;

    // NOTE: openGraph.images / twitter.images are intentionally OMITTED here.
    // Next.js auto-discovers ./opengraph-image.tsx and emits og:image,
    // og:image:width (1200), og:image:height (630), og:image:type meta tags
    // pointing to the edge-rendered card — which is 1.91:1 landscape (what
    // WhatsApp / Facebook / Twitter expect), CDN-cached, and renders in <1s.
    // Setting `images:` here would shadow the auto-generated card and force
    // scrapers to load the raw Supabase portrait image, which times out or
    // crops badly.
    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      alternates: { canonical: productUrl },
      openGraph: {
        title,
        description,
        url: productUrl,
        siteName: 'Luxury Steps Boutique',
        type: 'website',
        locale: 'en_GH',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {};
  }
}

export default function ProductDetailLayout({ children }: Props) {
  return <>{children}</>;
}
