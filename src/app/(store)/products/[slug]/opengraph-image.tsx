import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Luxury Steps Boutique';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

interface ProductRow {
  name: string;
  category: string;
  price: number;
  images: string[] | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  heels:     'Heels',
  flats:     'Flats & Slippers',
  handbags:  'Handbags',
  tote:      'Tote Bags',
  crossbody: 'Crossbody',
  mini:      'Mini Bags',
};

async function fetchProduct(slug: string): Promise<ProductRow | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&select=name,category,price,images` +
      `&limit=1`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
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

// Pre-fetch the product photo into memory and turn it into a base64 data URL.
// satori (the renderer inside next/og) chokes silently on remote <img> sources
// from CDNs that use chunked transfer-encoding or non-cacheable responses
// (e.g. Cloudflare in front of Supabase storage). Inline data URLs sidestep
// satori's image-loader entirely — it sees the bytes directly and just decodes.
async function fetchImageAsDataUrl(url: string | undefined): Promise<string | null> {
  if (!url || !url.startsWith('http')) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;

    const ct = res.headers.get('content-type') || 'image/jpeg';
    const buf = await res.arrayBuffer();

    // Hard cap so a rogue large upload can't blow up edge memory.
    if (buf.byteLength === 0 || buf.byteLength > 800_000) return null;

    // Edge-safe base64 encode (no Node Buffer).
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize) as unknown as number[]);
    }
    const base64 = btoa(binary);
    return `data:${ct};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function OGImage({ params }: { params: { slug: string } }) {
  let product: ProductRow | null = null;
  let photoDataUrl: string | null = null;

  try {
    product = await fetchProduct(params.slug);
    if (product) {
      photoDataUrl = await fetchImageAsDataUrl(product.images?.[0]);
    }
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
          {/* LEFT — product photo (inline) or LSB placeholder */}
          {photoDataUrl ? (
            <div
              style={{
                display: 'flex',
                width: 600,
                height: 630,
                flexShrink: 0,
                background: '#FFE0DA',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoDataUrl}
                alt=""
                width={600}
                height={630}
                style={{ width: 600, height: 630, objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                width: 600,
                height: 630,
                flexShrink: 0,
                background: '#FFE0DA',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 140,
                  fontWeight: 700,
                  color: '#C9956C',
                  letterSpacing: 12,
                  fontStyle: 'italic',
                  fontFamily: 'serif',
                }}
              >
                L · S · B
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: '#C9956C',
                  letterSpacing: 8,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Luxury Steps
              </div>
            </div>
          )}

          {/* RIGHT — scarlet editorial panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: 600,
              height: 630,
              background: '#C8102E',
              padding: '52px 48px',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, height: 1.5, background: '#C9956C' }} />
              <div
                style={{
                  fontSize: 13,
                  color: '#C9956C',
                  letterSpacing: 5,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Luxury Steps Boutique
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {category && (
                <div
                  style={{
                    fontSize: 13,
                    color: 'rgba(201,149,108,0.95)',
                    letterSpacing: 5,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {category}
                </div>
              )}
              <div
                style={{
                  fontSize: productName.length > 28 ? 48 : 58,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.05,
                  letterSpacing: -1,
                  fontFamily: 'serif',
                }}
              >
                {productName}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 38, fontWeight: 700, color: '#FFFFFF', letterSpacing: -0.5 }}>
                {priceLabel}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,250,248,0.55)',
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                KNUST Campus · Ashaiman · Ghana
              </div>
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
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
