import Anthropic from '@anthropic-ai/sdk';
import { TRIBES_DB } from '@/data/tribes';
import type { Tribe } from '@/lib/types';
import type { TribeQuizAnswers, ScoredTribe } from './tribe-quiz-scoring';

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

export interface QuizCandidate {
  tribeId: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning_ru: string;
  reasoning_kk: string;
}

export interface QuizResult {
  candidates: QuizCandidate[];
  disclaimer_ru: string;
  disclaimer_kk: string;
  usedFallback: boolean;
}

const RESULT_SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tribeId: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          reasoning_ru: { type: 'string' },
          reasoning_kk: { type: 'string' },
        },
        required: ['tribeId', 'confidence', 'reasoning_ru', 'reasoning_kk'],
        additionalProperties: false,
      },
    },
    disclaimer_ru: { type: 'string' },
    disclaimer_kk: { type: 'string' },
  },
  required: ['candidates', 'disclaimer_ru', 'disclaimer_kk'],
  additionalProperties: false,
} as const;

function findTribeById(id: string): Tribe | null {
  for (const zhuz of TRIBES_DB) {
    const t = zhuz.tribes.find((x) => x.id === id);
    if (t) return t;
  }
  return null;
}

const FALLBACK_DISCLAIMER_RU =
  'Автоматическое сопоставление по совпадениям (тамга, уран, регион) — без ИИ-анализа. Это предположение, уточните у старших в семье.';
const FALLBACK_DISCLAIMER_KK =
  'Сәйкестік бойынша автоматты салыстыру (таңба, ұран, аймақ) — ЖИ талдауынсыз. Бұл болжам, отбасы үлкендерінен нақтылаңыз.';

function fallbackResult(shortlist: ScoredTribe[]): QuizResult {
  return {
    candidates: shortlist.slice(0, 5).map((s) => ({
      tribeId: s.tribeId,
      confidence: s.score >= 60 ? 'high' : s.score >= 20 ? 'medium' : 'low',
      reasoning_ru: 'Определено по совпадению анкетных данных (тамга/уран/регион/жуз).',
      reasoning_kk: 'Анкета деректерінің сәйкестігі бойынша анықталды (таңба/ұран/аймақ/жүз).',
    })),
    disclaimer_ru: FALLBACK_DISCLAIMER_RU,
    disclaimer_kk: FALLBACK_DISCLAIMER_KK,
    usedFallback: true,
  };
}

/**
 * Этап B: LLM дочитывает полные текстовые описания top-8 кандидатов (этап A)
 * вместе со свободнотекстовыми ответами анкеты и возвращает ранжированный
 * список 3-5 финальных кандидатов с обоснованием на kk/ru.
 * При любой ошибке — деградация к rule-based списку без исключения.
 */
export async function analyzeWithLLM(
  shortlist: ScoredTribe[],
  answers: TribeQuizAnswers,
): Promise<QuizResult> {
  if (!client || shortlist.length === 0) {
    return fallbackResult(shortlist);
  }

  const candidatesContext = shortlist
    .map((s) => {
      const tribe = findTribeById(s.tribeId);
      if (!tribe) return null;
      return {
        tribeId: tribe.id,
        name_kk: tribe.kk,
        name_ru: tribe.ru,
        desc_ru: tribe.desc_ru,
        history_ru: tribe.history_ru ?? '',
        region_ru: tribe.region_ru,
        tamga: tribe.tamga,
        uran: tribe.uran,
        notable: tribe.notable.map((n) => `${n.name} — ${n.role_ru}`).join('; '),
        ruleScore: s.score,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const systemPrompt =
    'Ты помогаешь человеку предположить, к какому казахскому роду (ру) он может принадлежать, ' +
    'на основе анкеты о происхождении. Рассуждай только по списку кандидатов ниже — не придумывай ' +
    'роды вне списка. Учитывай как готовые баллы совпадений (ruleScore), так и качественные сигналы ' +
    'из свободного текста анкеты (семейные предания, известные родственники, предположения). Это ' +
    'ПОДСКАЗКА ДЛЯ УТОЧНЕНИЯ, а не окончательный генеалогический факт — каждое предположение ' +
    'формулируй как версию для проверки с родственниками, никогда как достоверное утверждение. ' +
    'Верни от 1 до 5 кандидатов, отсортированных по вероятности, с обоснованием на русском и казахском.';

  const userPrompt =
    `Кандидаты (топ по правилам):\n${JSON.stringify(candidatesContext, null, 2)}\n\n` +
    `Ответы анкеты пользователя:\n${JSON.stringify(answers, null, 2)}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: RESULT_SCHEMA },
      },
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    if (response.stop_reason === 'refusal') {
      return fallbackResult(shortlist);
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return fallbackResult(shortlist);
    }

    const parsed = JSON.parse(textBlock.text) as Omit<QuizResult, 'usedFallback'>;
    if (!parsed.candidates || parsed.candidates.length === 0) {
      return fallbackResult(shortlist);
    }

    return { ...parsed, usedFallback: false };
  } catch {
    return fallbackResult(shortlist);
  }
}
