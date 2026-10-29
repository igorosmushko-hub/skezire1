/**
 * Title / H1 / description builders for the encyclopedia (hub, zhuz, tribe cards).
 * Pure functions: no imports, so they can be checked from a plain Node script.
 *
 * Section `other` (Төре, Қожа, Төленгіт) holds groups, not tribes:
 * no «руы» / «Род» wording for it.
 */

const SITE = 'Шежіре';

export const KK_CARD_TITLE_MAX = 55;
export const RU_CARD_TITLE_MAX = 53;
export const DESCRIPTION_MAX = 160;

const len = (s: string) => Array.from(s).length;

export function isTribeSection(zhuzId: string): boolean {
  return zhuzId !== 'other';
}

/** «Род Аргын» / «Аргын руы»; groups outside the zhuzes keep the bare name. */
export function tribeHeading(name: string, zhuzId: string, isKk: boolean): string {
  if (!isTribeSection(zhuzId)) return name;
  return isKk ? `${name} руы` : `Род ${name}`;
}

export function tribeTitle(name: string, zhuzName: string, zhuzId: string, isKk: boolean): string {
  if (!isTribeSection(zhuzId)) {
    return isKk
      ? `${name} — жүзден тыс топ, шежіресі | ${SITE}`
      : `${name} — вне жузов: история и шежире | ${SITE}`;
  }
  if (isKk) {
    const full = `${name} руы — ${zhuzName} шежіресі, тармақтары | ${SITE}`;
    if (len(full) <= KK_CARD_TITLE_MAX) return full;
    return `${name} руы — ${zhuzName} шежіресі | ${SITE}`;
  }
  return `Род ${name} — ${zhuzName}: шежире и ветви | ${SITE}`;
}

/** «Старший жуз» -> «Старшего жуза» (the data stores the nominative). */
export function ruZhuzGenitive(ruName: string): string {
  return ruName.replace(/ий жуз$/, 'его жуза');
}

/** 1 род, 2-4 рода, 5+ родов (and 11-14 родов). */
export function ruTribesCount(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} род`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} рода`;
  return `${n} родов`;
}

export function zhuzTitle(zhuz: { id: string; kk: string; ru: string }, tribeCount: number, isKk: boolean): string {
  if (!isTribeSection(zhuz.id)) {
    return isKk
      ? `Жүзден тыс топтар — тізімі және шежіресі (${tribeCount} топ) | ${SITE}`
      : `Группы вне жузов: список и шежире (${tribeCount} ${tribeCount === 1 ? 'группа' : tribeCount < 5 ? 'группы' : 'групп'}) | ${SITE}`;
  }
  return isKk
    ? `${zhuz.kk} рулары — тізімі және шежіресі (${tribeCount} ру) | ${SITE}`
    : `Роды ${ruZhuzGenitive(zhuz.ru)}: список и шежире (${ruTribesCount(tribeCount)}) | ${SITE}`;
}

export function hubTitle(tribeCount: number, isKk: boolean): string {
  return isKk
    ? `Рулар шежіресі — ${tribeCount} қазақ руының тізімі | ${SITE}`
    : `Шежире казахских родов — список ${tribeCount} родов и жузов | ${SITE}`;
}

export function hubDescription(tribeCount: number, isKk: boolean): string {
  return isKk
    ? `Рулар шежіресі: үш жүз бойынша ${tribeCount} ру. Тармақтар, шежіре нұсқалары, дереккөздер және интерактивті картаға сілтемелер.`
    : `Шежире казахских родов: ${tribeCount} родов по трём жузам. Ветви, версии шежире, источники и переходы на интерактивную карту.`;
}

/**
 * Meta description from the card's own text: the first 1-2 sentences, cut at a
 * sentence boundary so that the result stays within `max` characters. When even
 * the first sentence is too long it is cut at a word boundary with an ellipsis.
 */
export function trimDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (len(clean) <= max) return clean;
  const out = joinSentences(sentencesOf(clean), max, 2);
  if (out) return out;
  const words = Array.from(clean).slice(0, max - 1).join('');
  return `${words.slice(0, words.lastIndexOf(' ')).replace(/[,;:—-]\s*$/, '')}…`;
}

const SHORT_DESCRIPTION = 80;

/**
 * Card description: the card's own `desc` (trimmed as above). Many catalogue cards
 * have a one-line `desc`; then the first sentences of the card's own `history`
 * are appended while they fit, so the snippet is not a bare «X — Y жүзі руы».
 */
export function cardDescription(desc: string, history?: string, max = DESCRIPTION_MAX): string {
  const base = trimDescription(desc, max);
  if (len(base) >= SHORT_DESCRIPTION || !history || base.endsWith('…')) return base;
  return joinSentences([base, ...sentencesOf(history)], max, 3) || base;
}

function sentencesOf(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+(?=\s|$)/g)?.map((s) => s.trim()) ?? [text];
}

function joinSentences(sentences: string[], max: number, limit: number): string {
  let out = '';
  for (const sentence of sentences.slice(0, limit)) {
    const next = out ? `${out} ${sentence}` : sentence;
    if (len(next) > max) break;
    out = next;
  }
  return out;
}
