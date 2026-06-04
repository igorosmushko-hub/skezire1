import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isAuthorized(req: NextRequest): boolean {
  if (!ADMIN_SECRET) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${ADMIN_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'DB unavailable' }, { status: 503 });
  }

  const days = 30;
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);
  const sinceIso = since.toISOString();

  // Daily registrations
  const { data: regRows, error: regErr } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false });

  if (regErr) {
    return NextResponse.json({ error: regErr.message }, { status: 500 });
  }

  // Daily payments (paid only)
  const { data: payRows, error: payErr } = await supabase
    .from('payments')
    .select('paid_at, amount_kzt')
    .eq('status', 'paid')
    .gte('paid_at', sinceIso)
    .order('paid_at', { ascending: false });

  if (payErr) {
    return NextResponse.json({ error: payErr.message }, { status: 500 });
  }

  // Build last 30 days as keys
  const dateMap: Record<string, { registrations: number; payments: number; amount: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dateMap[key] = { registrations: 0, payments: 0, amount: 0 };
  }

  for (const row of regRows ?? []) {
    const key = row.created_at?.slice(0, 10);
    if (key && dateMap[key]) dateMap[key].registrations++;
  }

  for (const row of payRows ?? []) {
    const key = row.paid_at?.slice(0, 10);
    if (key && dateMap[key]) {
      dateMap[key].payments++;
      dateMap[key].amount += row.amount_kzt ?? 0;
    }
  }

  const rows = Object.entries(dateMap)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ rows });
}
