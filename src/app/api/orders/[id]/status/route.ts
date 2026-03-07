import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const BOT_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Authorize via secret header (called from Telegram bot or admin)
  const authHeader = req.headers.get('x-bot-secret');
  if (!BOT_SECRET || authHeader !== BOT_SECRET) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'db_not_configured' }, { status: 503 });
  }

  const body = await req.json();
  const { status } = body as { status: string };

  const validStatuses = ['new', 'paid', 'in_production', 'shipped', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { status };
  if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
  if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('order_status_log').insert({ order_id: id, status });

  return NextResponse.json({ ok: true, status });
}
