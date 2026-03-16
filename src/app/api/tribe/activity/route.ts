import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const tribeId = searchParams.get('tribe_id');
  const zhuzId = searchParams.get('zhuz_id');
  const days = Math.min(parseInt(searchParams.get('days') ?? '30', 10), 90);

  const since = new Date();
  since.setDate(since.getDate() - days);

  let query = supabase
    .from('tribe_activity_log')
    .select('tribe_id, zhuz_id, date, new_members, total_members')
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  if (tribeId) query = query.eq('tribe_id', tribeId);
  if (zhuzId) query = query.eq('zhuz_id', zhuzId);

  const { data } = await query;

  const res = NextResponse.json({ activity: data ?? [] });
  res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  return res;
}
