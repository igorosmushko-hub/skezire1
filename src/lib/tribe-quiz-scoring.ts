import { TRIBES_DB } from '@/data/tribes';
import type { Tribe, Zhuz } from '@/lib/types';

export interface TribeQuizAnswers {
  zhuz?: string;              // 'uly' | 'orta' | 'kishi' | 'none' | undefined (не знаю)
  tribeGuess?: string;        // название рода — свободный ввод/автокомплит
  regionModern?: string;      // код области из kz-regions.ts
  auylFreeText?: string;
  tamgaGuess?: string;        // символ тамги, выбранный в picker'е
  uranGuess?: string;
  subgroupGuess?: string;     // 'bayuly' | 'zhetiru' | 'alimuly'
  surnameSample?: string;
  familyLore?: string;
  notablePersons?: string;
  familyClaim?: string;
  additionalNotes?: string;
}

export interface ScoredTribe {
  tribeId: string;
  zhuzId: string;
  score: number;
}

const KAZ_LETTER_MAP: Record<string, string> = {
  ә: 'а', ғ: 'г', қ: 'к', ң: 'н', ө: 'о', ұ: 'у', ү: 'у', һ: 'х', і: 'и', ы: 'и',
};

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[әғқңөұүһіы]/g, (ch) => KAZ_LETTER_MAP[ch] ?? ch)
    .replace(/[^a-zа-я0-9]+/g, '');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[] = Array(n + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

export function fuzzyMatch(input: string, target: string, maxDistance = 2): boolean {
  if (!input || !target) return false;
  const a = normalize(input);
  const b = normalize(target);
  if (!a || !b) return false;
  if (a === b || b.includes(a) || a.includes(b)) return true;
  return levenshtein(a, b) <= maxDistance;
}

function containsTribeNameMention(text: string, tribe: Tribe): boolean {
  const n = normalize(text);
  if (!n) return false;
  const names = [tribe.kk, tribe.ru, ...(tribe.subtribes ?? []).flatMap((s) => [s.kk, s.ru])];
  return names.some((name) => name && n.includes(normalize(name)));
}

function matchesSubgroup(tribe: Tribe, subgroupGuess: string): boolean {
  const g = normalize(subgroupGuess);
  return !!(
    (tribe.subgroup_kk && normalize(tribe.subgroup_kk).includes(g)) ||
    (tribe.subgroup_ru && normalize(tribe.subgroup_ru).includes(g))
  );
}

function scoreTribe(tribe: Tribe, zhuz: Zhuz, answers: TribeQuizAnswers): number {
  // Жёсткий фильтр по жузу, если известен
  if (answers.zhuz && answers.zhuz !== 'none' && zhuz.id !== answers.zhuz) {
    return -Infinity;
  }

  let score = 0;

  if (answers.tribeGuess && (normalize(answers.tribeGuess) === normalize(tribe.kk) || normalize(answers.tribeGuess) === normalize(tribe.ru))) {
    score += 100;
  }

  if (answers.tamgaGuess && answers.tamgaGuess === tribe.tamga) {
    score += 40;
  }

  if (answers.uranGuess && fuzzyMatch(answers.uranGuess, tribe.uran)) {
    score += 30;
  }

  if (answers.regionModern && tribe.regions.includes(answers.regionModern)) {
    score += 20;
  }

  if (answers.subgroupGuess && matchesSubgroup(tribe, answers.subgroupGuess)) {
    score += 15;
  }

  if (answers.familyClaim && containsTribeNameMention(answers.familyClaim, tribe)) {
    score += 25;
  }

  return score;
}

/**
 * Этап A: детерминированный скоринг всех родов по правилам.
 * Возвращает top-8 кандидатов (или меньше, если сопоставлений мало),
 * с бустом через relatedTribes для сохранения контекста соседних родов.
 */
export function getShortlist(answers: TribeQuizAnswers, limit = 8): ScoredTribe[] {
  const scored: ScoredTribe[] = [];

  for (const zhuz of TRIBES_DB) {
    for (const tribe of zhuz.tribes) {
      const score = scoreTribe(tribe, zhuz, answers);
      if (score === -Infinity) continue;
      scored.push({ tribeId: tribe.id, zhuzId: zhuz.id, score });
    }
  }

  // Буст через relatedTribes: если соседний род высоко набрал очки, слегка поднимаем и этот
  const byId = new Map(scored.map((s) => [s.tribeId, s]));
  for (const zhuz of TRIBES_DB) {
    for (const tribe of zhuz.tribes) {
      const current = byId.get(tribe.id);
      if (!current || !tribe.relatedTribes?.length) continue;
      const relatedMax = Math.max(
        0,
        ...tribe.relatedTribes.map((id) => byId.get(id)?.score ?? 0),
      );
      if (relatedMax > 0) current.score += Math.round(relatedMax * 0.1);
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
