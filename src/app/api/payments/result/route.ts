import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyResultSignature, resultOkResponse } from '@/lib/robokassa';
import { sendMessage, getAdminChatId, isBotConfigured } from '@/lib/telegram-bot';

async function notify(text: string) {
  if (!isBotConfigured()) return;
  try {
    await sendMessage({ chatId: getAdminChatId(), text, parseMode: 'HTML' });
  } catch { /* notification failure must not change payment processing */ }
}

function getParams(req: NextRequest, formData?: FormData) {
  const params = formData ?? req.nextUrl.searchParams;
  const get = (key: string): string | null => {
    const values = params.getAll(key);
    if (values.length > 1 || (values.length === 1 && typeof values[0] !== 'string')) {
      throw new Error('Ambiguous callback parameter');
    }
    return values[0] as string | undefined ?? null;
  };
  for (const key of params.keys()) {
    if (/^shp_/i.test(key) && key !== 'Shp_paymentId' && key !== 'Shp_orderId') {
      throw new Error('Unsupported custom parameter');
    }
  }
  return {
    OutSum: get('OutSum'),
    InvId: get('InvId'),
    SignatureValue: get('SignatureValue'),
    Shp_paymentId: get('Shp_paymentId'),
    Shp_orderId: get('Shp_orderId'),
  };
}

async function handleResult(req: NextRequest, formData?: FormData) {
  if (!process.env.ROBOKASSA_PASSWORD2) {
    return new NextResponse('Service unavailable', { status: 503 });
  }
  let params: ReturnType<typeof getParams>;
  try {
    params = getParams(req, formData);
  } catch {
    return new NextResponse('Invalid callback parameters', { status: 400 });
  }
  const { OutSum, InvId, SignatureValue, Shp_paymentId, Shp_orderId } = params;
  // OutSum is the KZT merchant amount, including six-decimal ResultURL values.
  // IncCurrLabel describes the payer's currency and is not a signed order currency.
  const targetId = Shp_paymentId ?? Shp_orderId;
  if (!OutSum || !/^\d{1,10}(?:\.\d{1,6})?$/.test(OutSum)
    || Number(OutSum) <= 0 || Number(OutSum) > 2147483647
    || !InvId || !/^[1-9]\d{0,9}$/.test(InvId) || Number(InvId) > 2147483647
    || !SignatureValue || !/^[a-f\d]{32}$/i.test(SignatureValue)
    || (Shp_paymentId !== null && Shp_orderId !== null)
    || !targetId || !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(targetId)) {
    return new NextResponse('Invalid callback parameters', { status: 400 });
  }

  const shpParams: Record<string, string> = {};
  if (Shp_orderId) shpParams.Shp_orderId = Shp_orderId;
  if (Shp_paymentId) shpParams.Shp_paymentId = Shp_paymentId;
  if (!verifyResultSignature(OutSum, InvId, SignatureValue, shpParams)) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return new NextResponse('Service unavailable', { status: 503 });
  }

  if (Shp_paymentId) {
    try {
      const { data, error } = await supabase.rpc('confirm_package_payment', {
        p_payment_id: Shp_paymentId,
        p_inv_id: Number(InvId),
        // Preserve decimal precision; PostgreSQL compares numeric to stored KZT.
        p_amount_kzt: OutSum,
      });
      if (error || (data !== 'credited' && data !== 'already_paid')) {
        await notify(`❌ Package payment not confirmed: InvId=${InvId}, code=${error?.code ?? 'unexpected_result'}`);
        return new NextResponse('Payment not confirmed', {
          status: error?.code === '22023' ? 400 : 503,
        });
      }
      if (data === 'credited') await notify(`✅ Package payment credited: InvId=${InvId}`);
    } catch {
      // Includes an uncertain outcome after a transport failure: retry is safe.
      return new NextResponse('Payment confirmation unavailable', { status: 503 });
    }
  }

  // Existing canvas-order flow; package fulfillment is handled only by the RPC.
  if (Shp_orderId) {
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', Shp_orderId)
      .eq('inv_id', Number(InvId));

    if (orderErr) {
      await notify(`❌ Order not found: id=${Shp_orderId}, inv_id=${InvId}`);
      return new NextResponse('Order not found', { status: 400 });
    }
    await notify(`✅ Order paid! InvId=${InvId}, orderId=${Shp_orderId}`);
  }

  return new NextResponse(resultOkResponse(InvId), {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new NextResponse('Invalid callback body', { status: 400 });
  }
  return handleResult(req, formData);
}

export async function GET(req: NextRequest) {
  return handleResult(req);
}
