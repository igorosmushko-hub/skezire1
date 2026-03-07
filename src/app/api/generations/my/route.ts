import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const { data: generations, error } = await supabase
    .from('generations')
    .select('id, type, result_url, status, created_at')
    .eq('user_id', user.userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch generations' }, { status: 500 });
  }

  return NextResponse.json({ generations: generations ?? [] });
}
