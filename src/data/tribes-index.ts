/**
 * Lightweight index of zhuz → tribes for dropdown selects.
 * Only contains id, kk, ru, subgroup names — no descriptions,
 * notable people, or history (~3 KB vs ~126 KB full TRIBES_DB).
 */

export interface TribeOption {
  id: string;
  kk: string;
  ru: string;
  subgroup_kk?: string;
  subgroup_ru?: string;
}

export interface ZhuzOption {
  id: string;
  kk: string;
  ru: string;
  tribes: TribeOption[];
}

export const ZHUZ_INDEX: ZhuzOption[] = [
  {
    id: 'uly', kk: 'Ұлы жүз', ru: 'Старший жуз',
    tribes: [
      { id: 'dulat', kk: 'Дулат', ru: 'Дулат' },
      { id: 'jalayir', kk: 'Жалайыр', ru: 'Жалайыр' },
      { id: 'shapyrashty', kk: 'Шапырашты', ru: 'Шапырашты' },
      { id: 'ysty', kk: 'Ысты', ru: 'Ысты' },
      { id: 'oshakty', kk: 'Ошақты', ru: 'Ошакты' },
      { id: 'sirgeli', kk: 'Сіргелі', ru: 'Сіргелі' },
      { id: 'kanly', kk: 'Қаңлы', ru: 'Каңлы' },
      { id: 'alban', kk: 'Албан', ru: 'Албан' },
      { id: 'suan', kk: 'Суан', ru: 'Суан' },
      { id: 'shanishkily', kk: 'Шанышқылы', ru: 'Шанышкылы' },
      { id: 'janyis', kk: 'Жаныс', ru: 'Жаныс' },
      { id: 'katagan', kk: 'Қатаған', ru: 'Катаган' },
    ],
  },
  {
    id: 'orta', kk: 'Орта жүз', ru: 'Средний жуз',
    tribes: [
      { id: 'argyn', kk: 'Арғын', ru: 'Аргын' },
      { id: 'naiman', kk: 'Найман', ru: 'Найман' },
      { id: 'kerey', kk: 'Керей', ru: 'Керей' },
      { id: 'kypshak', kk: 'Қыпшақ', ru: 'Кыпшак' },
      { id: 'uak', kk: 'Уақ', ru: 'Уак' },
      { id: 'konyrat', kk: 'Қоңырат', ru: 'Конырат' },
      { id: 'tarakty', kk: 'Таракты', ru: 'Таракты' },
      { id: 'merkit', kk: 'Меркіт', ru: 'Меркит' },
    ],
  },
  {
    id: 'kishi', kk: 'Кіші жүз', ru: 'Младший жуз',
    tribes: [
      { id: 'aday', kk: 'Адай', ru: 'Адай', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'baybakty', kk: 'Байбақты', ru: 'Байбакты', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'zhappas', kk: 'Жаппас', ru: 'Жаппас', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'alasha', kk: 'Алаша', ru: 'Алаша', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'bersh', kk: 'Берш', ru: 'Бериш', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'esentemir', kk: 'Есентемір', ru: 'Есентемир', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'maskar', kk: 'Маскар', ru: 'Маскар', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'tana', kk: 'Тана', ru: 'Тана', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'taz', kk: 'Таз', ru: 'Таз', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'sherkesh', kk: 'Шеркеш', ru: 'Черкес', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'ysyk', kk: 'Ысық', ru: 'Ысык', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'kyzylkurt', kk: 'Қызылқұрт', ru: 'Кызылкурт', subgroup_kk: 'Байұлы', subgroup_ru: 'Байулы' },
      { id: 'tabyn', kk: 'Табын', ru: 'Табын', subgroup_kk: 'Жетіру', subgroup_ru: 'Жетиру' },
      { id: 'tama', kk: 'Тама', ru: 'Тама', subgroup_kk: 'Жетіру', subgroup_ru: 'Жетиру' },
      { id: 'zhagalbayly', kk: 'Жағалбайлы', ru: 'Жагалбайлы', subgroup_kk: 'Жетіру', subgroup_ru: 'Жетиру' },
      { id: 'kerderi', kk: 'Кердері', ru: 'Кердери', subgroup_kk: 'Жетіру', subgroup_ru: 'Жетиру' },
      { id: 'teleu', kk: 'Телеу', ru: 'Телеу', subgroup_kk: 'Жетіру', subgroup_ru: 'Жетиру' },
      { id: 'ramadan', kk: 'Рамадан', ru: 'Рамадан', subgroup_kk: 'Жетіру', subgroup_ru: 'Жетиру' },
      { id: 'tileu', kk: 'Тілеу', ru: 'Тилеу', subgroup_kk: 'Жетіру', subgroup_ru: 'Жетиру' },
      { id: 'shomekei', kk: 'Шөмекей', ru: 'Шомекей', subgroup_kk: 'Әлімұлы', subgroup_ru: 'Алимулы' },
      { id: 'shekti', kk: 'Шекті', ru: 'Шекты', subgroup_kk: 'Әлімұлы', subgroup_ru: 'Алимулы' },
      { id: 'karakesek', kk: 'Қаракесек', ru: 'Каракесек', subgroup_kk: 'Әлімұлы', subgroup_ru: 'Алимулы' },
      { id: 'karatay', kk: 'Қаратай', ru: 'Каратай', subgroup_kk: 'Әлімұлы', subgroup_ru: 'Алимулы' },
      { id: 'kete', kk: 'Кете', ru: 'Кете', subgroup_kk: 'Әлімұлы', subgroup_ru: 'Алимулы' },
    ],
  },
  {
    id: 'other', kk: 'Жүзден тыс', ru: 'Вне жузов',
    tribes: [
      { id: 'tore', kk: 'Торе', ru: 'Торе (Чингизиды)' },
      { id: 'koja', kk: 'Қожа', ru: 'Кожа' },
      { id: 'tolengit', kk: 'Төленгіт', ru: 'Толенгит' },
    ],
  },
];
