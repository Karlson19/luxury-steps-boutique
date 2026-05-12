import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

// We don't cache this because it needs to run every time
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const sb = getServiceClient();

    // 1. Fetch current view count
    const { data: product } = await sb
      .from('products')
      .select('id, view_count')
      .eq('slug', slug)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 2. Increment view count by 1
    const newCount = (product.view_count || 0) + 1;

    // 3. Save it back to the database
    await sb
      .from('products')
      .update({ view_count: newCount })
      .eq('id', product.id);

    return NextResponse.json({ success: true, count: newCount });
  } catch {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
