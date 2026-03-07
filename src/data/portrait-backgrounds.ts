export interface PortraitBackground {
  key: string;
  icon: string;
  name: { kk: string; ru: string };
  prompt: string; // {count} placeholder replaced at runtime
}

export const PORTRAIT_BACKGROUNDS: PortraitBackground[] = [
  {
    key: 'yurt',
    icon: '\u26FA',
    name: { kk: '\u041A\u0438\u0456\u0437 \u04AF\u0439\u0434\u0435', ru: '\u0412 \u044E\u0440\u0442\u0435' },
    prompt: 'A warm family group portrait inside a traditional Kazakh yurt. All {count} people sitting together on ornamental carpets, warm golden light from shanyrak above, felt walls with tuskiiz tapestries. Professional photography, masterpiece.',
  },
  {
    key: 'steppe',
    icon: '\uD83C\uDF3E',
    name: { kk: '\u049A\u0430\u0437\u0430\u049B \u0434\u0430\u043B\u0430\u0441\u044B', ru: '\u041A\u0430\u0437\u0430\u0445\u0441\u043A\u0430\u044F \u0441\u0442\u0435\u043F\u044C' },
    prompt: 'A majestic family group portrait in the vast Kazakh steppe. All {count} people with endless golden grasslands and snow-capped mountains. Yurts and horses in background. Golden hour, professional photography.',
  },
  {
    key: 'newyear',
    icon: '\uD83C\uDF84',
    name: { kk: '\u0416\u0430\u04A3\u0430 \u0436\u044B\u043B', ru: '\u041D\u043E\u0432\u043E\u0433\u043E\u0434\u043D\u0435\u0435 \u0444\u043E\u0442\u043E' },
    prompt: 'A festive New Year family group portrait. All {count} people near a decorated Christmas tree with golden ornaments. Cozy room with fireplace, snowfall through window. Warm holiday atmosphere, professional photography.',
  },
  {
    key: 'got_castle',
    icon: '\uD83C\uDFF0',
    name: { kk: '\u0422\u0430\u049B\u0442\u0430\u0440 \u043E\u0439\u044B\u043D\u044B', ru: '\u0417\u0430\u043C\u043E\u043A \u0418\u0433\u0440\u044B \u041F\u0440\u0435\u0441\u0442\u043E\u043B\u043E\u0432' },
    prompt: 'An epic family group portrait in a grand medieval castle throne room. All {count} people in regal medieval clothing. Stone walls, iron throne, dramatic torchlight, banners. Cinematic lighting, masterpiece.',
  },
  {
    key: 'khanate',
    icon: '\u2694\uFE0F',
    name: { kk: '\u049A\u0430\u0437\u0430\u049B \u0445\u0430\u043D\u0434\u044B\u0493\u044B', ru: '\u041A\u0430\u0437\u0430\u0445\u0441\u043A\u043E\u0435 \u0445\u0430\u043D\u0441\u0442\u0432\u043E' },
    prompt: 'A historical family group portrait in the Kazakh Khanate era. All {count} people in traditional noble clothing with gold embroidery. Grand nomadic camp with white yurts and horses. Epic historical atmosphere.',
  },
  {
    key: 'royal_studio',
    icon: '\uD83D\uDDBC\uFE0F',
    name: { kk: '\u041A\u043B\u0430\u0441\u0441\u0438\u043A\u0430\u043B\u044B\u049B \u0441\u0442\u0443\u0434\u0438\u044F', ru: '\u041A\u043E\u0440\u043E\u043B\u0435\u0432\u0441\u043A\u0430\u044F \u0441\u0442\u0443\u0434\u0438\u044F' },
    prompt: 'An elegant formal family group portrait in a royal photography studio. All {count} people in refined attire. Baroque backdrop with velvet curtains and golden frames. Professional studio lighting, masterpiece.',
  },
  {
    key: 'modern_city',
    icon: '\uD83C\uDFD9\uFE0F',
    name: { kk: '\u049A\u0430\u043B\u0430 \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430\u0441\u044B', ru: '\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u0430\u044F \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430' },
    prompt: 'A stylish modern family group portrait on a rooftop at sunset. All {count} people with stunning city skyline behind. Contemporary fashion, golden hour light on skyscrapers. Professional photography.',
  },
  {
    key: 'garden',
    icon: '\uD83C\uDF38',
    name: { kk: '\u041A\u04E9\u043A\u0442\u0435\u043C\u0433\u0456 \u0431\u0430\u049B', ru: '\u0412\u0435\u0441\u0435\u043D\u043D\u0438\u0439 \u0441\u0430\u0434' },
    prompt: 'A beautiful family group portrait in a blooming spring garden. All {count} people surrounded by cherry blossoms, tulips, roses. Soft dappled sunlight, dreamy bokeh. Warm spring atmosphere, professional photography.',
  },
  {
    key: 'kazakh_ornament',
    icon: '\uD83C\uDFA8',
    name: { kk: '\u04B0\u043B\u0442\u0442\u044B\u049B \u043E\u044E-\u04E9\u0440\u043D\u0435\u043A', ru: '\u041D\u0430\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u043E\u0440\u043D\u0430\u043C\u0435\u043D\u0442' },
    prompt: 'A stunning family group portrait with rich Kazakh national ornament background. All {count} people in traditional Kazakh clothing. Elaborate geometric patterns in gold, blue, red. Professional studio photography.',
  },
  {
    key: 'space',
    icon: '\uD83D\uDE80',
    name: { kk: '\u0492\u0430\u0440\u044B\u0448', ru: '\u041A\u043E\u0441\u043C\u043E\u0441' },
    prompt: 'A fantastical family group portrait in outer space. All {count} people in astronaut suits with visors open. Earth and nebula visible behind. Dramatic sci-fi lighting, photorealistic, masterpiece.',
  },
];

export function getBackgroundByKey(key: string): PortraitBackground | undefined {
  return PORTRAIT_BACKGROUNDS.find((b) => b.key === key);
}
