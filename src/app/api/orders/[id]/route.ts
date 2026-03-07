import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const { id } = await params;

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, user_id, product_id, image_url, image_stored, ai_type, recipient_name, recipient_phone, city, address, postal_code, amount_kzt, delivery_cost, inv_id, payment_status, status, tracking_number, tracking_url, admin_notes, created_at, paid_at, shipped_at, delivered_at, products(name_kk, name_ru, type, size, price_kzt)')
    .eq('id', id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Ensure user can only see their own orders
  if (order.user_id !== user.userId) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Remove user_id from response
  const { user_id: _, ...orderData } = order;

  return NextResponse.json(orderData);
}
