import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { createPaymentUrl, createPaymentParams } from '@/lib/robokassa';

const QUIZ_PRICE_KZT = 990;

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
  const { resultId, locale } = body as { resultId: string; locale?: string };

  if (!resultId) {
    return NextResponse.json({ error: 'resultId is required' }, { status: 400 });
  }

  const { data: quizResult, error: quizErr } = await supabase
    .from('tribe_quiz_results')
    .select('id, user_id, paid')
    .eq('id', resultId)
    .single();

  if (quizErr || !quizResult) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  if (quizResult.paid) {
    return NextResponse.json({ alreadyPaid: true });
  }

  // Квиз мог быть пройден анонимно до логина — привязываем к аккаунту сейчас.
  if (!quizResult.user_id) {
    await supabase
      .from('tribe_quiz_results')
      .update({ user_id: user.userId })
      .eq('id', resultId)
      .is('user_id', null);
  } else if (quizResult.user_id !== user.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .insert({
      user_id: user.userId,
      quiz_result_id: resultId,
      amount_kzt: QUIZ_PRICE_KZT,
      status: 'pending',
    })
    .select('id, inv_id')
    .single();

  if (payErr || !payment) {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }

  const description = 'Skezire: tribe quiz result';
  const opts = { culture: locale, shpParams: { Shp_paymentId: payment.id } };

  const url = createPaymentUrl(payment.inv_id, QUIZ_PRICE_KZT, description, opts);
  const params = createPaymentParams(payment.inv_id, QUIZ_PRICE_KZT, description, opts);

  return NextResponse.json({ url, params });
}
