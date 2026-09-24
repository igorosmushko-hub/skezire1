export interface KzRegion {
  id: string;
  kk: string;
  ru: string;
}

/** 17 областей и 3 города республиканского значения РК (после разделения 2022 г.) */
export const KZ_REGIONS: KzRegion[] = [
  { id: 'akmola-oblast', kk: 'Ақмола облысы', ru: 'Акмолинская область' },
  { id: 'aktobe-oblast', kk: 'Ақтөбе облысы', ru: 'Актюбинская область' },
  { id: 'almaty-oblast', kk: 'Алматы облысы', ru: 'Алматинская область' },
  { id: 'atyrau-oblast', kk: 'Атырау облысы', ru: 'Атырауская область' },
  { id: 'abai-oblast', kk: 'Абай облысы', ru: 'Абайская область' },
  { id: 'east-kazakhstan-oblast', kk: 'Шығыс Қазақстан облысы', ru: 'Восточно-Казахстанская область' },
  { id: 'zhambyl-oblast', kk: 'Жамбыл облысы', ru: 'Жамбылская область' },
  { id: 'zhetysu-oblast', kk: 'Жетісу облысы', ru: 'Жетысуская область' },
  { id: 'west-kazakhstan-oblast', kk: 'Батыс Қазақстан облысы', ru: 'Западно-Казахстанская область' },
  { id: 'karagandy-oblast', kk: 'Қарағанды облысы', ru: 'Карагандинская область' },
  { id: 'kostanay-oblast', kk: 'Қостанай облысы', ru: 'Костанайская область' },
  { id: 'kyzylorda-oblast', kk: 'Қызылорда облысы', ru: 'Кызылординская область' },
  { id: 'mangystau-oblast', kk: 'Маңғыстау облысы', ru: 'Мангистауская область' },
  { id: 'pavlodar-oblast', kk: 'Павлодар облысы', ru: 'Павлодарская область' },
  { id: 'north-kazakhstan-oblast', kk: 'Солтүстік Қазақстан облысы', ru: 'Северо-Казахстанская область' },
  { id: 'turkistan-oblast', kk: 'Түркістан облысы', ru: 'Туркестанская область' },
  { id: 'ulytau-oblast', kk: 'Ұлытау облысы', ru: 'Улытауская область' },
  { id: 'almaty-city', kk: 'Алматы қаласы', ru: 'г. Алматы' },
  { id: 'astana-city', kk: 'Астана қаласы', ru: 'г. Астана' },
  { id: 'shymkent-city', kk: 'Шымкент қаласы', ru: 'г. Шымкент' },
];

export function regionLabel(id: string, locale: string): string {
  const r = KZ_REGIONS.find((x) => x.id === id);
  if (!r) return id;
  return locale === 'kk' ? r.kk : r.ru;
}
