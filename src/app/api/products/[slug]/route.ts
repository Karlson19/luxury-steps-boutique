import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// IMPORTANT: this route must NEVER be cached. The admin panel writes back to
// the same `products` table that this endpoint reads from. If Vercel's edge
// CDN holds a cached response, the product detail page shows stale data even
// after the admin has saved changes — affects sizes, colors, price, images,
// description, everything. Force-dynamic + explicit no-store headers ensure
// every request hits Supabase live.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const sb = getServiceClient();
    const { data: product, error } = await sb
      .from('products')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404, headers: { 'Cache-Control': 'no-store, max-age=0' } },
      );
    }

    const { data: related } = await sb
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', product.id)
      .limit(4);

    return NextResponse.json(
      { product, related: related ?? [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }
}
