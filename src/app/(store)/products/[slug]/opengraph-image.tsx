import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Luxury Steps Boutique';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Defensive defaults so the route never throws at module load.
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

interface ProductRow {
  name: string;
  category: string;
  price: number;
}

async function fetchProduct(slug: string): Promise<ProductRow | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&select=name,category,price` +
      `&limit=1`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        Accept: 'application/json',
      },
      signal: ctrl.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const rows = (await res.json()) as ProductRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

const CATEGORY_LABEL: Record<string, string> = {
  heels:     'Heels',
  flats:     'Flats & Slippers',
  handbags:  'Handbags',
  tote:      'Tote Bags',
  crossbody: 'Crossbody',
  mini:      'Mini Bags',
};

export default async function OGImage({ params }: { params: { slug: string } }) {
  // Self-contained, two-panel branded card. NO external image is embedded
  // inside ImageResponse — that's the class of bug that returns 0-byte PNGs
  // when the upstream image is slow / unreachable / odd-content-type.
  // Product photo lives on the page itself; the OG card carries the brand.
  let product: ProductRow | null = null;
  try {
    product = await fetchProduct(params.slug);
  } catch {
    product = null;
  }

  const productName = product?.name ?? 'Luxury Steps Boutique';
  const category = product?.category ? (CATEGORY_LABEL[product.category] ?? product.category) : '';
  const priceLabel = product ? `GHS ${product.price.toLocaleString()}` : 'Premium shoes & bags';

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: 1200,
            height: 630,
            fontFamily: 'sans-serif',
          }}
        >
          {/* LEFT — ivory plate with editorial wordmark + product name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 600,
              height: 630,
              background: '#FFFAF8',
              padding: '60px 56px',
              justifyContent: 'space-between',
            }}
          >
            {/* Top eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 1.5, background: '#C9956C' }} />
              <div
                style={{
                  fontSize: 13,
                  color: '#A87850',
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Luxury Steps Boutique
              </div>
            </div>

            {/* Product name as the editorial headline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  fontSize: 14,
                  color: '#7B1818',
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                {category || 'New Arrival'}
              </div>
              <div
                style={{
                  fontSize: productName.length > 28 ? 52 : 64,
                  fontWeight: 700,
                  color: '#1A0A0A',
                  lineHeight: 1.05,
                  letterSpacing: -1,
                  fontFamily: 'serif',
                }}
              >
                {productName}
              </div>
            </div>

            {/* Price + footer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: '#C8102E',
                  letterSpacing: -0.5,
                }}
              >
                {priceLabel}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#7A5050',
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                KNUST Campus · Ashaiman · Ghana
              </div>
            </div>
          </div>

          {/* RIGHT — scarlet plate with the L·S·B monogram */}
          <div
            style={{
              display: 'flex',
              width: 600,
              height: 630,
              background: '#C8102E',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 180,
                fontWeight: 700,
                color: '#C9956C',
                letterSpacing: 14,
                fontStyle: 'italic',
                fontFamily: 'serif',
                lineHeight: 1,
              }}
            >
              L · S · B
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#FFFAF8',
                letterSpacing: 8,
                textTransform: 'uppercase',
                fontWeight: 600,
                opacity: 0.85,
              }}
            >
              Boutique
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    // Last-resort fallback: pure scarlet card with the monogram only.
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: 1200,
            height: 630,
            background: '#C8102E',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 18,
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 168,
              fontWeight: 700,
              color: '#C9956C',
              letterSpacing: 14,
              fontStyle: 'italic',
              fontFamily: 'serif',
            }}
          >
            L · S · B
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#FFFAF8',
              letterSpacing: 10,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Luxury Steps Boutique
          </div>
        </div>
      ),
      { ...size },
    );
  }
}
