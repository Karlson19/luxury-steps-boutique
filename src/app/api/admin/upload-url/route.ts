import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get('filename');
  const type = searchParams.get('type');

  if (!filename || !type) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  try {
    const supabase = getServiceClient();
    const path = `products/${filename}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .createSignedUploadUrl(path);

    if (error || !data) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    return NextResponse.json({ url: data.signedUrl, publicUrl });
  } catch {
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
