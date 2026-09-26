import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Read current availability and prices, including after a failed request.
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ products: [] }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, type, size, name_kk, name_ru, price_kzt')
    .eq('active', true)
    .order('sort_order');

  return NextResponse.json(
    { products: error ? [] : data ?? [] },
    { status: error ? 503 : 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
