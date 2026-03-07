import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { createPaymentUrl } from '@/lib/robokassa';

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const body = await req.json();
  const {
    productId,
    imageUrl,
    aiType,
    recipientName,
    recipientPhone,
    city,
    address,
    postalCode,
    locale,
  } = body as {
    productId: string;
    imageUrl: string;
    aiType: string;
    recipientName: string;
    recipientPhone: string;
    city: string;
    address: string;
    postalCode?: string;
    locale?: string;
  };

  // Validate required fields
  if (!productId || !imageUrl || !aiType || !recipientName || !recipientPhone || !city || !address) {
    return NextResponse.json(
      { error: 'Missing required fields: productId, imageUrl, aiType, recipientName, recipientPhone, city, address' },
      { status: 400 },
    );
  }

  // Look up product
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, type, size, name_kk, name_ru, price_kzt, active')
    .eq('id', productId)
    .single();

  if (prodErr || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (!product.active) {
    return NextResponse.json({ error: 'Product is not available' }, { status: 400 });
  }

  // Download image from external URL and upload to Supabase Storage
  let imageStored: string;
  try {
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      return NextResponse.json({ error: 'Failed to download image' }, { status: 400 });
    }
    const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
    const contentType = imgResponse.headers.get('content-type') || 'image/png';
    const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
    const storagePath = `${user.userId}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('order-images')
      .upload(storagePath, imgBuffer, { contentType, upsert: false });

    if (uploadErr) {
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
    imageStored = storagePath;
  } catch {
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }

  // Generate unique inv_id: max(inv_id) + 1, starting from 10001
  const { data: maxRow } = await supabase
    .from('orders')
    .select('inv_id')
    .order('inv_id', { ascending: false })
    .limit(1)
    .single();

  const invId = maxRow?.inv_id ? maxRow.inv_id + 1 : 10001;

  // Calculate totals
  const deliveryCost = 0;
  const amountKzt = product.price_kzt + deliveryCost;

  // Create order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: user.userId,
      product_id: product.id,
      image_url: imageUrl,
      image_stored: imageStored,
      ai_type: aiType,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      city,
      address,
      postal_code: postalCode || null,
      amount_kzt: amountKzt,
      delivery_cost: deliveryCost,
      inv_id: invId,
      payment_status: 'pending',
      status: 'new',
    })
    .select('id, inv_id')
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }

  // Generate RoboCassa payment URL
  const productName = locale === 'kk' ? product.name_kk : product.name_ru;
  const description = `Skezire: ${productName}`;

  const url = createPaymentUrl(order.inv_id, amountKzt, description, {
    culture: locale,
    shpParams: { Shp_orderId: order.id },
  });

  return NextResponse.json({ url, orderId: order.id });
}
