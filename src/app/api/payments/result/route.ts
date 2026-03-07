import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { verifyResultSignature, resultOkResponse } from '@/lib/robokassa';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return new NextResponse('Service unavailable', { status: 503 });
  }

  // RoboCassa sends form-encoded body
  const formData = await req.formData();
  const OutSum = formData.get('OutSum') as string | null;
  const InvId = formData.get('InvId') as string | null;
  const SignatureValue = formData.get('SignatureValue') as string | null;
  const Shp_paymentId = formData.get('Shp_paymentId') as string | null;

  if (!OutSum || !InvId || !SignatureValue || !Shp_paymentId) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const shpParams: Record<string, string> = { Shp_paymentId };

  const valid = verifyResultSignature(OutSum, InvId, SignatureValue, shpParams);
  if (!valid) {
    return new NextResponse('Invalid signature', { status: 400 });
  }

  // Update payment status
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

  // Get package generations count
  const { data: pkg } = await supabase
    .from('packages')
    .select('generations')
    .eq('id', payment.package_id)
    .single();

  if (pkg) {
    // Credit generations to user
    await supabase.rpc('increment_paid_generations', {
      p_user_id: payment.user_id,
      p_amount: pkg.generations,
    });
  }

  return new NextResponse(resultOkResponse(InvId), {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
