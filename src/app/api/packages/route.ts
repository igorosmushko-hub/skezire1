import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Package prices must match the amount read by the payment endpoint.
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ packages: [] }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const { data, error } = await supabase
    .from('packages')
    .select('id, slug, name_kk, name_ru, generations, price_kzt')
    .eq('active', true)
    .order('sort_order');

  return NextResponse.json(
    { packages: error ? [] : data ?? [] },
    { status: error ? 503 : 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
