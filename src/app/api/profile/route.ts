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
    .select('id, phone, name, usage_count, paid_generations, created_at')
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
      usageCount,
      paidGenerations,
      totalAvailable,
      remaining,
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

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (typeof body.name === 'string') {
    updates.name = body.name.trim().slice(0, 100);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', session.userId);

  if (error) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
