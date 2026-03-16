import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { validateTribeBelongsToZhuz } from '@/lib/tribe-utils';

const COOLDOWN_DAYS = 30;

export async function POST(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  let body: { zhuzId?: string; tribeId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { zhuzId, tribeId } = body;
  if (!zhuzId || !tribeId) {
    return NextResponse.json({ error: 'zhuzId and tribeId required' }, { status: 400 });
  }

  if (!validateTribeBelongsToZhuz(zhuzId, tribeId)) {
    return NextResponse.json({ error: 'invalid_tribe' }, { status: 400 });
  }

  // Check current tribe + cooldown
  const { data: user } = await supabase
    .from('users')
    .select('tribe_id, tribe_joined_at')
    .eq('id', session.userId)
    .single();

  if (user?.tribe_id === tribeId) {
    return NextResponse.json({ error: 'already_in_tribe' }, { status: 400 });
  }

  if (user?.tribe_joined_at) {
    const joinedAt = new Date(user.tribe_joined_at);
    const cooldownEnd = new Date(joinedAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    if (new Date() < cooldownEnd) {
      return NextResponse.json({
        error: 'cooldown',
        cooldownUntil: cooldownEnd.toISOString(),
      }, { status: 429 });
    }
  }

  // Update user's tribe
  const { error } = await supabase
    .from('users')
    .update({
      zhuz_id: zhuzId,
      tribe_id: tribeId,
      tribe_joined_at: new Date().toISOString(),
    })
    .eq('id', session.userId);

  if (error) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, zhuzId, tribeId });
}
