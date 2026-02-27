interface JsonLdProps {
  locale: string;
}

export function JsonLd({ locale }: JsonLdProps) {
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';

  const faqKk = [
    {
      '@type': 'Question',
      name: 'Шежіре деген не?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Шежіре — қазақ халқының ата-тек тарихын жеті буынға дейін сақтайтын генеалогиялық дәстүр. Әр қазақ жеті атасын білуге тиіс.',
      },
    },
    {
      '@type': 'Question',
      name: 'Жеті ата дәстүрі қандай?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Жеті ата — қазақ дәстүрі бойынша әр адам өзінің жеті буын бабасын білуге тиіс. Бұл туыстық байланысты сақтап, некені реттеуде маңызды рөл атқарады.',
      },
    },
    {
      '@type': 'Question',
      name: 'Руымды қалай анықтаймын?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Сайтта жүзіңізді (Ұлы, Орта немесе Кіші жүз) таңдаңыз, содан кейін руыңызды іздеңіз. Әр рудың өз тамғасы, ұраны және тарихы бар.',
      },
    },
    {
      '@type': 'Question',
      name: 'Шежіре сайтын тегін пайдалануға бола ма?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Иә, Шежіре сайты толығымен тегін. Генеалогиялық ағашыңызды жасап, суретті жүктей аласыз.',
      },
    },
  ];

  const faqRu = [
    {
      '@type': 'Question',
      name: 'Что такое Шежіре?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Шежіре — казахская генеалогическая традиция, сохраняющая историю рода до семи поколений. Каждый казах должен знать своих предков до седьмого колена (жеті ата).',
      },
    },
    {
      '@type': 'Question',
      name: 'Как определить свой казахский род?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Выберите свой жуз (Старший, Средний или Младший) и род (ру) на нашем сайте. Каждый род имеет свою тамгу, уран и историю.',
      },
    },
    {
      '@type': 'Question',
      name: 'Что такое жеті ата?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Жеті ата (семь предков) — казахская традиция знать своих предков до седьмого колена. Это важно для сохранения родственных связей и истории рода.',
      },
    },
    {
      '@type': 'Question',
      name: 'Сайт Шежіре бесплатный?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да, сайт Шежіре полностью бесплатный. Вы можете создать генеалогическое дерево и скачать изображение.',
      },
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Шежіре',
        alternateName: ['Shezhire', 'Шежире'],
        url: `${base}/`,
        description: isKk
          ? 'Қазақ ата-тегінің онлайн ағашы — шежіре жасау, руыңызды анықтау, жеті атаңызды білу'
          : 'Казахское генеалогическое дерево онлайн — составьте шежіре, узнайте свой род и предков до 7 колена',
        inLanguage: isKk ? 'kk' : 'ru',
      },
      {
        '@type': 'Organization',
        name: 'Шежіре',
        url: `${base}/`,
        description: isKk
          ? 'Болашақ ұрпақтар үшін ата-тек тарихын сақтаймыз'
          : 'Сохраняем историю рода для будущих поколений',
      },
      {
        '@type': 'FAQPage',
        inLanguage: isKk ? 'kk' : 'ru',
        mainEntity: isKk ? faqKk : faqRu,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
