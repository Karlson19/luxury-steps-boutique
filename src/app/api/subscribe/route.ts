import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    const trimmed = email.trim().toLowerCase();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const sb = getServiceClient();
    const { error } = await sb.from('subscribers').insert([{ email: trimmed, source: source ?? 'footer' }]);
    if (error) {
      // Duplicate → still treat as success
      if (error.code === '23505') return NextResponse.json({ ok: true, already: true });
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
