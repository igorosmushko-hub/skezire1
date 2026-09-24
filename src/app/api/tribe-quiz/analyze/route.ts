import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getShortlist, type TribeQuizAnswers } from '@/lib/tribe-quiz-scoring';
import { analyzeWithLLM } from '@/lib/tribe-quiz-llm';

/** Квиз анонимный — логин требуется только на шаге "Присоединиться к роду" */
export async function POST(req: NextRequest) {
  let answers: TribeQuizAnswers;
  try {
    answers = (await req.json()) as TribeQuizAnswers;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const shortlist = getShortlist(answers);
  const result = await analyzeWithLLM(shortlist, answers);

  const supabase = getSupabase();
  let resultId: string | null = null;

  if (supabase) {
    const session = getSessionUser(req);
    const { data, error } = await supabase
      .from('tribe_quiz_results')
      .insert({
        user_id: session?.userId ?? null,
        answers,
        rule_scores: shortlist,
        suggested_tribe_ids: result.candidates.map((c) => c.tribeId),
        // Полный результат (candidates + disclaimers) сохраняем всегда, включая fallback —
        // он раскрывается пользователю только после оплаты через /api/tribe-quiz/result/[id].
        llm_reasoning: result,
        llm_error: result.usedFallback ? 'llm_unavailable_or_failed' : null,
      })
      .select('id')
      .single();

    if (!error && data) resultId = data.id;
  }

  // Полный пейвол: сам результат (роды/обоснование) не отдаём здесь —
  // клиент должен оплатить квиз и получить его через /api/tribe-quiz/result/[id].
  return NextResponse.json({ resultId });
}
