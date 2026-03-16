import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { findTribe } from '@/lib/tribe-utils';

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  const { data } = await supabase
    .from('users')
    .select('zhuz_id, tribe_id, tribe_joined_at')
    .eq('id', session.userId)
    .single();

  if (!data?.tribe_id) {
    return NextResponse.json({ tribe: null });
  }

  const found = findTribe(data.tribe_id);

  return NextResponse.json({
    tribe: {
      zhuzId: data.zhuz_id,
      tribeId: data.tribe_id,
      joinedAt: data.tribe_joined_at,
      name_kk: found?.tribe.kk ?? data.tribe_id,
      name_ru: found?.tribe.ru ?? data.tribe_id,
      zhuz_kk: found?.zhuz.kk ?? data.zhuz_id,
      zhuz_ru: found?.zhuz.ru ?? data.zhuz_id,
      tamga: found?.tribe.tamga ?? '',
    },
  });
}
