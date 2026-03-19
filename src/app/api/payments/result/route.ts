import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyResultSignature, resultOkResponse } from '@/lib/robokassa';

/**
 * Parse Robokassa callback params from either POST form data or GET query string.
 */
function getParams(req: NextRequest, formData?: FormData) {
  const get = (key: string): string | null => {
    if (formData) {
      return formData.get(key) as string | null;
    }
    return req.nextUrl.searchParams.get(key);
  };
  return {
    OutSum: get('OutSum'),
    InvId: get('InvId'),
    SignatureValue: get('SignatureValue'),
    Shp_paymentId: get('Shp_paymentId'),
    Shp_orderId: get('Shp_orderId'),
  };
}

async function handleResult(req: NextRequest, formData?: FormData) {
  const supabase = getSupabase();
  if (!supabase) {
    return new NextResponse('Service unavailable', { status: 503 });
  }

  const { OutSum, InvId, SignatureValue, Shp_paymentId, Shp_orderId } = getParams(req, formData);

  if (!OutSum || !InvId || !SignatureValue) {
    return new NextResponse('Bad request: missing OutSum, InvId, or SignatureValue', { status: 400 });
  }

  if (!Shp_paymentId && !Shp_orderId) {
    return new NextResponse('Bad request: missing Shp_paymentId or Shp_orderId', { status: 400 });
  }

  // Build shp params for signature verification (only include what was sent)
  const shpParams: Record<string, string> = {};
  if (Shp_orderId) shpParams.Shp_orderId = Shp_orderId;
  if (Shp_paymentId) shpParams.Shp_paymentId = Shp_paymentId;

  const valid = verifyResultSignature(OutSum, InvId, SignatureValue, shpParams);
  if (!valid) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // --- Handle token package payment ---
  if (Shp_paymentId) {
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', Shp_paymentId)
      .eq('inv_id', Number(InvId))
      .select('id, user_id, package_id')
      .single();

    if (payErr || !payment) {
      return new NextResponse('Payment not found', { status: 400 });
    }

    // Credit generations to user
    const { data: pkg } = await supabase
      .from('packages')
      .select('generations')
      .eq('id', payment.package_id)
      .single();

    if (pkg) {
      await supabase.rpc('increment_paid_generations', {
        p_user_id: payment.user_id,
        p_amount: pkg.generations,
      });
    }
  }

  // --- Handle canvas/painting order payment ---
  if (Shp_orderId) {
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', Shp_orderId)
      .eq('inv_id', Number(InvId));

    if (orderErr) {
      return new NextResponse('Order not found', { status: 400 });
    }
  }

  return new NextResponse(resultOkResponse(InvId), {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// Robokassa can send ResultURL as POST (form-encoded) or GET
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  return handleResult(req, formData);
}

export async function GET(req: NextRequest) {
  return handleResult(req);
}
