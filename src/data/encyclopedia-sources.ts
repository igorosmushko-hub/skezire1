export interface EncyclopediaSource {
  id: string;
  title: string;
  url: string;
  locator: string;
}

export const ENCYCLOPEDIA_SOURCES: Record<string, EncyclopediaSource> = {
  S01: { id: 'S01', title: 'Zhabagin et al. (2020), The medieval Mongolian roots of Y-chromosomal lineages from South Kazakhstan', url: 'https://nur.nu.edu.kz/server/api/core/bitstreams/149970e1-29cd-4bbb-9f5b-9d6d08757fc6/content#page=2', locator: 'pp. 2, 6' },
  S02: { id: 'S02', title: 'Khussainova et al. (2022), Genetic Relationship Among the Kazakh People Based on Y-STR Markers', url: 'https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2021.801295/pdf#page=3', locator: 'pp. 3, 5' },
  S03: { id: 'S03', title: 'Сабитов, Акчурин (2014), Генеалогии (шежире) и генетические данные', url: 'https://e-history.kz/storage/upload/library_ru_files/iblock/466/466f0aefb8e0bd84db2fd1229debd88d.pdf#page=9', locator: 'печатная с. 135 / PDF 9; версии шежіре' },
  S04: { id: 'S04', title: 'Zhunussova et al. (2025), Genetic genealogy of Y-chromosome in the Zhetiru tribe', url: 'https://www.frontiersin.org/journals/genetics/articles/10.3389/fgene.2025.1516130/pdf#page=2', locator: 'p. 2' },
  S05: { id: 'S05', title: 'Zhabagin et al. (2024), Y-Chromosomal insights into the paternal genealogy of the Kerey tribe', url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0309080', locator: 'Introduction after Fig. 1; versions of genealogy' },
  S06: { id: 'S06', title: 'М. А. Алпысбес (2013), Шежире казахов: источники и традиции', url: 'https://e-history.kz/media/upload/55/2013/11/14/da28b9ae10323ce3df11d8203758d819.pdf#page=176', locator: 'pp. 176–177; variants of шежіре' },
  S07: { id: 'S07', title: 'Г. Н. Потанин, Исследования и материалы (2006)', url: 'https://e-history.kz/storage/upload/library_ru_files/iblock/acb/acbee20225f27866f2479cf4b16f3435.pdf#page=236', locator: 'печатные с. 239–241 / PDF 236–238; recorded tradition' },
  S08: { id: 'S08', title: 'Ж. М. Сабитов, О происхождении казахских родов сарыуйсун, дулат, албан, суан, ысты, шапырашты, ошакты, сиргелы', url: 'https://e-history.kz/ru/seo-materials/show/28956', locator: 'пункты 1–4; cited genealogy tradition' },
  S09: { id: 'S09', title: 'Баймуханов, Баимбетов (2018), Генетический субклад ZQ5 объединения «Алимулы»', url: 'https://bulletin-history.kaznu.kz/index.php/1-history/article/download/235/239/#page=5', locator: 'печатная с. 176 / PDF 5; отдельные линии, не полный список ветвей' },
  S10: { id: 'S10', title: 'UNESCO World Heritage Centre, Mausoleum of Khoja Ahmed Yasawi', url: 'https://whc.unesco.org/en/list/1103/', locator: 'Description' },
  S11: { id: 'S11', title: 'Адаи в трудах В. И. Равдоникаса', url: 'https://e-history.kz/ru/news/show/339885', locator: 'вторичный пересказ; сезонные кочевья и Жеменей' },
  S12: { id: 'S12', title: 'Тылахметова, Смагулов (2019), Туленгуты в этническом составе казахов — библиографический кандидат', url: 'https://otan.history.iie.kz/main/article/view/477', locator: 'аннотация; полный текст не проверен' },
  SEO09_1: {"id": "SEO09_1", "title": "Кабанбай: Каракерей — Найман", "url": "https://e-history.kz/ru/prominent-figures/show/12610", "locator": "SEO-09: Қабанбай: Қаракерей — Найман"},
  SEO09_2: {"id": "SEO09_2", "title": "Историческое расселение и ураны", "url": "https://e-history.kz/media/scorm/263/312/text/text.htm", "locator": "SEO-09: Тарихи қоныстар мен ұрандар"},
  SEO09_3: {"id": "SEO09_3", "title": "Варианты тамг и уранов по труду З. Саника", "url": "https://e-history.kz/kz/news/show/32220", "locator": "SEO-09: З. Сәнік еңбегі бойынша таңба мен ұран нұсқалары"},
  SEO09_4: {"id": "SEO09_4", "title": "М. Алпысбес: варианты шежіре (PDF)", "url": "https://e-history.kz/media/upload/55/2013/11/14/153a98314cc9f051e401501cc99e933a.pdf#page=174", "locator": "SEO-09: М. Алпысбес: шежіре нұсқалары (PDF)"},
  SEO09_5: {"id": "SEO09_5", "title": "Т. Акеров: название и происхождение Найман (PDF)", "url": "https://elib.sfu-kras.ru/bitstream/2311/21633/1/11_Akerov.pdf#page=2", "locator": "SEO-09: Т. Акеров: Найман атауы мен шығу тегі (PDF)"},
  SEO09_6: {"id": "SEO09_6", "title": "З. Сабитов и соавторы: версия шежіре Найман (PDF)", "url": "https://e-history.kz/storage/upload/library_ru_files/iblock/1ed/1ede50eac69290c6f22b361aebda9c8f.pdf#page=6", "locator": "SEO-09: З. Сабитов және әріптестері: Найман шежіресінің нұсқасы (PDF)"},
  SEO09_7: {"id": "SEO09_7", "title": "Бухар жырау: род Аргын", "url": "https://e-history.kz/ru/prominent-figures/show/12647", "locator": "SEO-09: Бұқар жырау: Арғын руы"},
  SEO09_8: {"id": "SEO09_8", "title": "Абай: Тобыкты в составе Аргын", "url": "https://e-history.kz/kz/amp/news/show/50000940", "locator": "SEO-09: Абай: Арғынның Тобықты руы"},
  SEO09_9: {"id": "SEO09_9", "title": "Биография Абая", "url": "https://e-history.kz/kz/prominent-figures/show/12481", "locator": "SEO-09: Абайдың өмірбаяны"},
  SEO09_10: {"id": "SEO09_10", "title": "Толе би: Жаныс — Дулат", "url": "https://e-history.kz/ru/prominent-figures/show/12642", "locator": "SEO-09: Төле би: Жаныс — Дулат"},
  SEO09_11: {"id": "SEO09_11", "title": "Институт Ауэзова: Дулат и Жаныс (названия родов)", "url": "https://auezovinstitute.kz/?page_id=9125", "locator": "SEO-09: Әуезов институты: Дулат пен Жаныс (ру атаулары)"},
  SEO09_12: {"id": "SEO09_12", "title": "Адай в составе Байулы (комментарии к сборнику, PDF)", "url": "https://e-history.kz/upload/iblock/bc5/bc5642b860870b527bea471059d12594.pdf#page=426", "locator": "SEO-09: Адай: Байұлы құрамында (жинақ түсініктемесі, PDF)"},
  SEO09_13: {"id": "SEO09_13", "title": "Т. Аралбай: версия шежіре Адай (с. 166, PDF)", "url": "https://csmb.kz/images/csmbkz/ocyfrovannye/aralbai.pdf#page=167", "locator": "SEO-09: Т. Аралбай: Адай шежіресінің нұсқасы (166-бет, PDF)"},
  SEO09_14: {"id": "SEO09_14", "title": "Бекет ата: биография и шежіре", "url": "https://e-history.kz/kz/news/show/33270", "locator": "SEO-09: Бекет ата: өмірбаяны мен шежіресі"},
  SEO09_15: {"id": "SEO09_15", "title": "О династии Керей-хана", "url": "https://e-history.kz/ru/prominent-figures/show/12623", "locator": "SEO-09: Керей ханның әулеті туралы"},
  SEO09_16: {"id": "SEO09_16", "title": "PLOS ONE: исследование ветвей Керей", "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0309080", "locator": "SEO-09: PLOS ONE: Керей тармақтары туралы зерттеу"},

};

export const ENCYCLOPEDIA_SOURCE_IDS_BY_TRIBE: Record<string, readonly string[]> = {
  dulat: ['S01', 'S08', 'SEO09_10', 'SEO09_11', 'SEO09_3'], jalayir: ['S01', 'S06'], shapyrashty: ['S01'], ysty: ['S01'], oshakty: ['S01'], sirgeli: ['S01'], kanly: ['S01'], alban: ['S01', 'S07'], suan: ['S01'], shanishkily: ['S01'], janyis: ['S08', 'SEO09_10', 'SEO09_11'], katagan: ['S03'],
  argyn: ['S02', 'S07', 'SEO09_7', 'SEO09_2', 'SEO09_3', 'SEO09_4', 'SEO09_8', 'SEO09_9'], naiman: ['S03', 'S06', 'S07', 'SEO09_1', 'SEO09_2', 'SEO09_3', 'SEO09_4', 'SEO09_5', 'SEO09_6'], kerey: ['S01', 'S05', 'S06', 'SEO09_4', 'SEO09_15', 'SEO09_2', 'SEO09_3', 'SEO09_16'], kypshak: ['S06', 'S07'], uak: ['S07'], konyrat: ['S02', 'S06'], tarakty: ['S07'], merkit: ['S05'],
  aday: ['S03', 'S11', 'SEO09_12', 'SEO09_3', 'SEO09_13', 'SEO09_14'], baybakty: ['S03'], zhappas: ['S03'], alasha: ['S03'], bersh: ['S03'], esentemir: ['S03'], maskar: ['S03'], tana: ['S03'], taz: ['S03'], sherkesh: ['S03'], ysyk: ['S03'], kyzylkurt: ['S03'],
  tabyn: ['S04'], tama: ['S04'], zhagalbayly: ['S04'], kerderi: ['S04'], teleu: ['S04', 'S06'], ramadan: ['S04'], tileu: ['S04', 'S06'],
  shomekei: ['S03', 'S09'], shekti: ['S03'], karakesek: ['S03'], karatay: ['S03'], kete: ['S03', 'S09'],
  tore: ['S02'], koja: ['S02', 'S10'], tolengit: ['S12'],
};


export const ENCYCLOPEDIA_SOURCE_IDS_BY_SECTION: Record<string, readonly string[]> = {
  uly: ['S01', 'S08', 'SEO09_2'],
  orta: ['S02', 'S05', 'S07', 'SEO09_2'],
  kishi: ['S03', 'S04', 'SEO09_2'],
  other: ['S02', 'S12'],
};

export function getEncyclopediaSources(tribeId: string): EncyclopediaSource[] {
  return (ENCYCLOPEDIA_SOURCE_IDS_BY_TRIBE[tribeId] ?? ENCYCLOPEDIA_SOURCE_IDS_BY_SECTION[tribeId] ?? []).map(id => ENCYCLOPEDIA_SOURCES[id]);
}
