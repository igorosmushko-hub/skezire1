import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

const FREE_LIMIT = 3;

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
    .select('id, phone, name, first_name, last_name, usage_count, paid_generations, zhuz_id, tribe_id, created_at')
    .eq('id', session.userId)
    .single();

  if (!data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const usageCount = data.usage_count ?? 0;
  const paidGenerations = data.paid_generations ?? 0;
  const totalAvailable = FREE_LIMIT + paidGenerations;
  const remaining = Math.max(0, totalAvailable - usageCount);

  return NextResponse.json({
    profile: {
      id: data.id,
      phone: data.phone,
      name: data.name ?? null,
      firstName: data.first_name ?? null,
      lastName: data.last_name ?? null,
      usageCount,
      paidGenerations,
      totalAvailable,
      remaining,
      zhuzId: data.zhuz_id ?? null,
      tribeId: data.tribe_id ?? null,
      createdAt: data.created_at,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  let body: { firstName?: string; lastName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (typeof body.firstName === 'string') {
    updates.first_name = body.firstName.trim().slice(0, 50) || null;
  }
  if (typeof body.lastName === 'string') {
    updates.last_name = body.lastName.trim().slice(0, 50) || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  // Update legacy name column for backward compat
  const firstName = (updates.first_name !== undefined ? updates.first_name : null) ?? '';
  const lastName = (updates.last_name !== undefined ? updates.last_name : null) ?? '';
  updates.name = [firstName, lastName].filter(Boolean).join(' ') || null;

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', session.userId);

  if (error) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', session.userId);

  if (error) {
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete('sb-session');
  return res;
}
