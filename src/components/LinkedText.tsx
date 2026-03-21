import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Mapping of keywords → internal URLs for inline text linking.
 * Each entry: [keyword_kk, keyword_ru, path_without_locale]
 * Only the first occurrence of each keyword in a text block is linked.
 */
const LINK_MAP: [string, string, string][] = [
  // Жузы
  ['Ұлы жүз', 'Старший жуз', '/encyclopedia/uly'],
  ['Орта жүз', 'Средний жуз', '/encyclopedia/orta'],
  ['Кіші жүз', 'Младший жуз', '/encyclopedia/kishi'],

  // Uly zhuz tribes
  ['Дулат', 'Дулат', '/encyclopedia/uly/dulat'],
  ['Жалайыр', 'Жалайыр', '/encyclopedia/uly/jalayir'],
  ['Шапырашты', 'Шапырашты', '/encyclopedia/uly/shapyrashty'],
  ['Ысты', 'Ысты', '/encyclopedia/uly/ysty'],
  ['Ошақты', 'Ошакты', '/encyclopedia/uly/oshakty'],
  ['Сіргелі', 'Сіргелі', '/encyclopedia/uly/sirgeli'],
  ['Қаңлы', 'Каңлы', '/encyclopedia/uly/kanly'],
  ['Албан', 'Албан', '/encyclopedia/uly/alban'],
  ['Суан', 'Суан', '/encyclopedia/uly/suan'],
  ['Шанышқылы', 'Шанышкылы', '/encyclopedia/uly/shanishkily'],
  ['Қатаған', 'Катаган', '/encyclopedia/uly/katagan'],

  // Orta zhuz tribes
  ['Арғын', 'Аргын', '/encyclopedia/orta/argyn'],
  ['Найман', 'Найман', '/encyclopedia/orta/naiman'],
  ['Керей', 'Керей', '/encyclopedia/orta/kerey'],
  ['Қыпшақ', 'Кыпшак', '/encyclopedia/orta/kypshak'],
  ['Уақ', 'Уак', '/encyclopedia/orta/uak'],
  ['Қоңырат', 'Конырат', '/encyclopedia/orta/konyrat'],
  ['Таракты', 'Таракты', '/encyclopedia/orta/tarakty'],
  ['Меркіт', 'Меркит', '/encyclopedia/orta/merkit'],

  // Kishi zhuz tribes (Bayuly)
  ['Адай', 'Адай', '/encyclopedia/kishi/aday'],
  ['Байбақты', 'Байбакты', '/encyclopedia/kishi/baybakty'],
  ['Жаппас', 'Жаппас', '/encyclopedia/kishi/zhappas'],
  ['Алаша', 'Алаша', '/encyclopedia/kishi/alasha'],
  ['Берш', 'Бериш', '/encyclopedia/kishi/bersh'],
  ['Есентемір', 'Есентемир', '/encyclopedia/kishi/esentemir'],
  ['Маскар', 'Маскар', '/encyclopedia/kishi/maskar'],
  ['Шеркеш', 'Черкес', '/encyclopedia/kishi/sherkesh'],
  ['Ысық', 'Ысык', '/encyclopedia/kishi/ysyk'],
  ['Қызылқұрт', 'Кызылкурт', '/encyclopedia/kishi/kyzylkurt'],

  // Kishi zhuz tribes (Jetiru)
  ['Табын', 'Табын', '/encyclopedia/kishi/tabyn'],
  ['Тама', 'Тама', '/encyclopedia/kishi/tama'],
  ['Жағалбайлы', 'Жагалбайлы', '/encyclopedia/kishi/zhagalbayly'],
  ['Кердері', 'Кердери', '/encyclopedia/kishi/kerderi'],
  ['Телеу', 'Телеу', '/encyclopedia/kishi/teleu'],
  ['Рамадан', 'Рамадан', '/encyclopedia/kishi/ramadan'],
  ['Тілеу', 'Тилеу', '/encyclopedia/kishi/tileu'],

  // Kishi zhuz tribes (Alimuly)
  ['Шөмекей', 'Шомекей', '/encyclopedia/kishi/shomekei'],
  ['Шекті', 'Шекты', '/encyclopedia/kishi/shekti'],
  ['Қаракесек', 'Каракесек', '/encyclopedia/kishi/karakesek'],
  ['Қаратай', 'Каратай', '/encyclopedia/kishi/karatay'],
  ['Кете', 'Кете', '/encyclopedia/kishi/kete'],

  // Other
  ['Торе', 'Торе', '/encyclopedia/other/tore'],
  ['Қожа', 'Кожа', '/encyclopedia/other/koja'],
  ['Төленгіт', 'Толенгит', '/encyclopedia/other/tolengit'],

  // Glossary terms
  ['тамға', 'тамга', '/glossary'],
  ['ұран', 'уран', '/glossary'],
  ['жеті ата', 'жеті ата', '/zheti-ata'],
  ['шежіре', 'шежіре', '/glossary'],
];

/**
 * Replaces known keywords in text with <Link> elements.
 * Only links the FIRST occurrence of each keyword.
 * Skips keywords that match the current page (selfPath).
 */
export function LinkedText({
  text,
  locale,
  className,
  selfPath,
}: {
  text: string;
  locale: string;
  className?: string;
  /** Path of the current page (without locale prefix), e.g. '/encyclopedia/uly/dulat' — skipped from linking */
  selfPath?: string;
}) {
  const isKk = locale === 'kk';

  // Build list of {keyword, href} for this locale
  const entries = LINK_MAP
    .map(([kk, ru, path]) => ({
      keyword: isKk ? kk : ru,
      href: `/${locale}${path}`,
      path,
    }))
    .filter((e) => e.path !== selfPath && e.keyword.length >= 2);

  // Sort by keyword length descending so longer matches take priority
  entries.sort((a, b) => b.keyword.length - a.keyword.length);

  // Find all matches with positions, only first occurrence per keyword
  type Match = { start: number; end: number; keyword: string; href: string };
  const matches: Match[] = [];
  const usedRanges: [number, number][] = [];

  const textLower = text.toLowerCase();

  for (const entry of entries) {
    const keyLower = entry.keyword.toLowerCase();
    const idx = textLower.indexOf(keyLower);
    if (idx === -1) continue;

    const end = idx + entry.keyword.length;

    // Check overlap with existing matches
    const overlaps = usedRanges.some(
      ([s, e]) => idx < e && end > s
    );
    if (overlaps) continue;

    matches.push({ start: idx, end, keyword: text.slice(idx, end), href: entry.href });
    usedRanges.push([idx, end]);
  }

  if (matches.length === 0) {
    return <p className={className}>{text}</p>;
  }

  // Sort by position
  matches.sort((a, b) => a.start - b.start);

  // Build JSX fragments
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (cursor < m.start) {
      parts.push(text.slice(cursor, m.start));
    }
    parts.push(
      <Link key={i} href={m.href} style={{ color: '#003082', textDecoration: 'underline', textDecorationColor: 'rgba(0,48,130,0.3)', textUnderlineOffset: '2px' }}>
        {m.keyword}
      </Link>
    );
    cursor = m.end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <p className={className}>{parts}</p>;
}
