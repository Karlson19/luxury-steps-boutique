import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Luxury Steps Boutique';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Defensive defaults so the route NEVER throws at module level.
// Edge runtime treats top-level throws as a hard fail (returns 200 + 0 bytes).
const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

interface ProductRow {
  name: string;
  category: string;
  price: number;
  images: string[] | null;
}

async function fetchProduct(slug: string): Promise<ProductRow | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return null;
  try {
    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?slug=eq.${encodeURIComponent(slug)}` +
      `&select=name,category,price,images` +
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
      // Edge cache the same request for an hour
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

// Quick HEAD probe to make sure the product photo is small enough to embed
// in the OG card without busting the edge runtime memory budget.
const MAX_IMAGE_BYTES = 500_000;

async function productImageSafe(url: string | undefined): Promise<string | null> {
  if (!url || !url.startsWith('http')) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const len = parseInt(res.headers.get('content-length') || '0', 10);
    return len > 0 && len <= MAX_IMAGE_BYTES ? url : null;
  } catch {
    return null;
  }
}

// Branded placeholder card — used both as the "no product photo" fallback
// AND as the absolute-error fallback so the route always returns a valid PNG.
function BrandFallback({ subtitle }: { subtitle: string }) {
  return (
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
        fontFamily: 'serif',
      }}
    >
      <div
        style={{
          fontSize: 168,
          fontWeight: 700,
          color: '#C9956C',
          letterSpacing: 14,
          fontStyle: 'italic',
        }}
      >
        L · S · B
      </div>
      <div
        style={{
          fontSize: 22,
          color: '#FFFAF8',
          letterSpacing: 10,
          textTransform: 'uppercase',
          fontWeight: 600,
          fontFamily: 'sans-serif',
        }}
      >
        Luxury Steps Boutique
      </div>
      <div
        style={{
          fontSize: 14,
          color: 'rgba(255,250,248,0.65)',
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontFamily: 'sans-serif',
          marginTop: 4,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

export default async function OGImage({ params }: { params: { slug: string } }) {
  // EVERYTHING is wrapped in try/catch so any failure still returns a
  // valid PNG. A 0-byte response is the worst outcome — scrapers reject it.
  try {
    const product = await fetchProduct(params.slug);

    if (!product) {
      return new ImageResponse(<BrandFallback subtitle="Premium shoes & bags · Ghana" />, {
        ...size,
      });
    }

    const safeImage = await productImageSafe(product.images?.[0]);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: 1200,
            height: 630,
            background: '#FFFAF8',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Left: product photo or LSB placeholder block */}
          {safeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={safeImage}
              alt=""
              width={630}
              height={630}
              style={{ width: 630, height: 630, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 630,
                height: 630,
                flexShrink: 0,
                background: '#FFE0DA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 124,
                  color: '#C9956C',
                  fontWeight: 700,
                  letterSpacing: 10,
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                }}
              >
                L · S · B
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: '#C9956C',
                  letterSpacing: 6,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Luxury Steps
              </div>
            </div>
          )}

          {/* Right: scarlet info panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              background: '#C8102E',
              padding: '52px 48px',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: '#C9956C',
                letterSpacing: 6,
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Luxury Steps Boutique
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  fontSize: product.name.length > 30 ? 36 : 44,
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </div>
              {product.category && (
                <div
                  style={{
                    fontSize: 14,
                    color: 'rgba(201,149,108,0.95)',
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                  }}
                >
                  {product.category}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#FFFFFF' }}>
                GHS {product.price.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.55)',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                luxurystepsboutique.vercel.app
              </div>
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    return new ImageResponse(<BrandFallback subtitle="Premium shoes & bags · Ghana" />, {
      ...size,
    });
  }
}
