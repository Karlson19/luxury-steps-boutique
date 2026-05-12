import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT NULL;',
    instruction: 'Run this SQL in your Supabase dashboard SQL editor.',
  });
}
