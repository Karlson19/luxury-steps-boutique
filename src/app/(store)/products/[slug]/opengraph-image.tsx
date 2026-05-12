import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Luxury Steps Boutique';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://luxury-steps-boutique.vercel.app');

// Max image size the Edge runtime can comfortably embed (~500KB).
// Anything larger is dropped and we render a clean LSB placeholder
// — better than the route returning 0 bytes and breaking the whole preview.
const MAX_IMAGE_BYTES = 500_000;

async function imageIsLightEnough(url: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(url, { method: 'HEAD', signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return false;
    const size = parseInt(res.headers.get('content-length') || '0', 10);
    return size > 0 && size <= MAX_IMAGE_BYTES;
  } catch {
    return false;
  }
}

export default async function OGImage({ params }: { params: { slug: string } }) {
  try {
    const res = await fetch(`${SITE_URL}/api/products/${params.slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('not found');
    const { product } = await res.json();

    const rawImage: string | undefined = product.images?.[0];
    const showImage = rawImage?.startsWith('http')
      ? await imageIsLightEnough(rawImage)
      : false;

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
          {/* ── Left: product photo or placeholder ── */}
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rawImage}
              alt=""
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
              <div style={{ fontSize: 88, color: '#C9956C', fontWeight: 900, letterSpacing: 4 }}>
                LSB
              </div>
              <div style={{ fontSize: 18, color: '#C9956C', letterSpacing: 6, textTransform: 'uppercase' }}>
                Luxury Steps Boutique
              </div>
            </div>
          )}

          {/* ── Right: info panel ── */}
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
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                luxury-steps-boutique.vercel.app
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
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
            gap: 16,
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 900, color: '#FFFFFF', letterSpacing: 6 }}>
            Luxury Steps Boutique
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 4 }}>
            PREMIUM SHOES &amp; BAGS · GHANA
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
