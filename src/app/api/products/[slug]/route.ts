import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const sb = getServiceClient();
    const { data: product, error } = await sb
      .from('products')
      .select('*')
      .eq('slug', params.slug)
      .single();

    if (error || !product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: related } = await sb
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', product.id)
      .limit(4);

    return NextResponse.json({ product, related: related ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
