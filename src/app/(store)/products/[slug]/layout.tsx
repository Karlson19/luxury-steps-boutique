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
      .select('name, description, images, price')
      .eq('slug', params.slug)
      .single();

    if (!data) return {};

    const siteUrl = getSiteUrl();
    const productUrl = `${siteUrl}/products/${params.slug}`;
    const image = data.images?.[0] ?? `${siteUrl}/og-image.jpg`;
    const title = `${data.name} | Luxury Steps Boutique`;
    const description = data.description ?? `Hand-picked piece. GHS ${data.price.toLocaleString()}`;

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
        images: [
          {
            url: image,
            width: 800,
            height: 1000,
            alt: data.name,
          },
        ],
        type: 'website',
        locale: 'en_GH',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {};
  }
}

export default function ProductDetailLayout({ children }: Props) {
  return <>{children}</>;
}
