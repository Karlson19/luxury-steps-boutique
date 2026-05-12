import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

// ✅ FIXED: Added async/await for Next.js 15 cookies
async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sb = getServiceClient();
    const { data, error } = await sb.from('discounts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const sb = getServiceClient();
    const { data, error } = await sb.from('discounts').insert([{ ...body, code: body.code.toUpperCase().trim() }]).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id, ...updates } = await req.json();
    const sb = getServiceClient();
    const { data, error } = await sb.from('discounts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await req.json();
    const sb = getServiceClient();
    const { error } = await sb.from('discounts').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
