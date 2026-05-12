import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sb = getServiceClient();
    
    // 1. Try to fetch the most viewed products
    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('view_count', { ascending: false })
      .limit(4);

    // 2. If the view_count column doesn't exist in Supabase yet, fallback to Newest products
    if (error) {
      const fallback = await sb
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false })
        .limit(4);
      return NextResponse.json({ data: fallback.data ?? [] });
    }

    // 3. If views are 0 (nobody has clicked anything yet), sort by newest instead
    if (data && data.length > 0 && (data[0].view_count === 0 || data[0].view_count === null)) {
       const newest = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
       return NextResponse.json({ data: newest });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trending' }, { status: 500 });
  }
}
