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

  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, product_id, image_url, ai_type, recipient_name, city, amount_kzt, delivery_cost, payment_status, status, tracking_number, tracking_url, created_at, paid_at, shipped_at, delivered_at, products(name_kk, name_ru, type, size)')
    .eq('user_id', user.userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}
