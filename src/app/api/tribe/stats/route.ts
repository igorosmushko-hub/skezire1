import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { TRIBES_DB } from '@/data/tribes';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  // Get all tribe stats
  const { data: stats } = await supabase
    .from('tribe_stats')
    .select('tribe_id, zhuz_id, member_count, today_count, today_date')
    .order('member_count', { ascending: false });

  // Get total users with tribe
  const { count: totalUsers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .not('tribe_id', 'is', null);

  // Build zhuz aggregates
  type StatRow = NonNullable<typeof stats>[number];
  const zhuzMap: Record<string, { memberCount: number; tribes: StatRow[] }> = {};
  for (const zhuz of TRIBES_DB) {
    zhuzMap[zhuz.id] = { memberCount: 0, tribes: [] };
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  for (const s of stats ?? []) {
    const todayCount = s.today_date === todayStr ? (s.today_count ?? 0) : 0;
    const entry = { ...s, today_count: todayCount };

    const zhuzEntry = zhuzMap[s.zhuz_id];
    if (zhuzEntry) {
      zhuzEntry.memberCount += s.member_count ?? 0;
      zhuzEntry.tribes.push(entry);
    }
  }

  const zhuzStats = TRIBES_DB.map((zhuz) => ({
    zhuzId: zhuz.id,
    name_kk: zhuz.kk,
    name_ru: zhuz.ru,
    memberCount: zhuzMap[zhuz.id]?.memberCount ?? 0,
    tribes: zhuzMap[zhuz.id]?.tribes ?? [],
  }));

  const res = NextResponse.json({
    totalUsers: totalUsers ?? 0,
    zhuzStats,
    tribes: stats ?? [],
  });

  res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
  return res;
}
