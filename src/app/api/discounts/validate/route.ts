import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    const sb = getServiceClient();
    const { data: discount, error } = await sb
      .from('discounts')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .single();

    if (error || !discount) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
    }

    // Expiry check
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This code has expired' }, { status: 400 });
    }

    // Max uses check
    if (discount.max_uses !== null && discount.used_count >= discount.max_uses) {
      return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 });
    }

    // Min order check
    if (subtotal < (discount.min_order ?? 0)) {
      return NextResponse.json({
        error: `Minimum order of GHS ${discount.min_order} required`,
      }, { status: 400 });
    }

    // Calculate initial discount amount
    const amount = discount.type === 'percent'
      ? Math.round((subtotal * discount.value) / 100)
      : Math.min(discount.value, subtotal);

    return NextResponse.json({
      data: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        amount,
        min_order: discount.min_order,
        description: discount.description,
        expires_at: discount.expires_at ?? null, // stored in cart so expired codes auto-clear on reload
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
