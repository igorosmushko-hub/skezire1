import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import type { QuizResult } from '@/lib/tribe-quiz-llm';

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

  const { data: quizResult, error } = await supabase
    .from('tribe_quiz_results')
    .select('paid, llm_reasoning')
    .eq('id', id)
    .eq('user_id', user.userId)
    .single();

  if (error || !quizResult) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  if (!quizResult.paid) {
    return NextResponse.json({ paid: false });
  }

  const result = quizResult.llm_reasoning as QuizResult;

  return NextResponse.json({
    paid: true,
    candidates: result.candidates,
    disclaimer_ru: result.disclaimer_ru,
    disclaimer_kk: result.disclaimer_kk,
  });
}
