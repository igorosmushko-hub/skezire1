import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ packages: [] });
  }

  const { data } = await supabase
    .from('packages')
    .select('id, slug, name_kk, name_ru, generations, price_kzt')
    .eq('active', true)
    .order('sort_order');

  return NextResponse.json({ packages: data ?? [] });
}
