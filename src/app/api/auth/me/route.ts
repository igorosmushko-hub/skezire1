import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const FREE_LIMIT = 3;

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) return NextResponse.json({ user: null });

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ user: { ...session, remaining: FREE_LIMIT } });
  }

  const { data } = await supabase
    .from('users')
    .select('usage_count, paid_generations, zhuz_id, tribe_id, first_name')
    .eq('id', session.userId)
    .single();

  const usageCount = data?.usage_count ?? 0;
  const paidGenerations = data?.paid_generations ?? 0;
  const totalAvailable = FREE_LIMIT + paidGenerations;
  const remaining = Math.max(0, totalAvailable - usageCount);

  return NextResponse.json({
    user: {
      id: session.userId,
      phone: session.phone,
      remaining,
      firstName: data?.first_name ?? undefined,
      zhuzId: data?.zhuz_id ?? undefined,
      tribeId: data?.tribe_id ?? undefined,
    },
  });
}
