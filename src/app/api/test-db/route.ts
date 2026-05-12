import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
  .from('products')
  .select('*')
  .order('created_at', { ascending: false });

return NextResponse.json({ data, error, count: data?.length });
  } catch (err) {
    return NextResponse.json({ caught: String(err) });
  }
}
