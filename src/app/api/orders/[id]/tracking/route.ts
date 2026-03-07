import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const BOT_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? '';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
  const { trackingNumber, trackingUrl } = body as { trackingNumber: string; trackingUrl?: string };

  if (!trackingNumber) {
    return NextResponse.json({ error: 'tracking_number_required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('orders')
    .update({
      tracking_number: trackingNumber,
      tracking_url: trackingUrl ?? null,
      status: 'shipped',
      shipped_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('order_status_log').insert({
    order_id: id,
    status: 'shipped',
    comment: `Tracking: ${trackingNumber}`,
  });

  return NextResponse.json({ ok: true });
}
