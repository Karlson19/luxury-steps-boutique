import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getServiceClient } from '@/lib/supabase';

async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

function revalidateStorefront(slug?: string) {
  revalidatePath('/', 'page');
  revalidatePath('/products', 'page');
  revalidatePath('/products', 'layout');
  if (slug) revalidatePath(`/products/${slug}`, 'page');
}

// 🟢 UNLOCKED: Customers can now fetch products without a password!
export async function GET() {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 🔴 LOCKED: Only Admin can Create products
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const payload = await req.json();
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('products')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    revalidateStorefront(data?.slug);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    console.error('Insert error:', err);
    const message = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 🔴 LOCKED: Only Admin can Update products
export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, ...payload } = await req.json();
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    revalidateStorefront(data?.slug);
    return NextResponse.json({ data });
  } catch (err: unknown) {
    console.error('Update error:', err);
    const message = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 🔴 LOCKED: Only Admin can Delete products
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, slug } = await req.json();
    const sb = getServiceClient();
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw error;
    revalidateStorefront(slug);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
