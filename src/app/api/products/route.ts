import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const revalidate = 3600;

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ products: [] });
  }

  const { data } = await supabase
    .from('products')
    .select('id, type, size, name_kk, name_ru, price_kzt')
    .eq('active', true)
    .order('sort_order');

  return NextResponse.json(
    { products: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  );
}
