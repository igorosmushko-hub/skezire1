export function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Шежіре',
        alternateName: ['Shezhire', 'Шежире'],
        url: 'https://skezire.kz/',
        description: 'Қазақ ата-тегінің онлайн ағашы — шежіре жасау, руыңызды анықтау, жеті атаңызды білу',
        inLanguage: ['kk', 'ru'],
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://skezire.kz/?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'Шежіре',
        url: 'https://skezire.kz/',
        description: 'Болашақ ұрпақтар үшін ата-тек тарихын сақтаймыз',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
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
            name: 'Жеті ата дәстүрі қандай?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Жеті ата — қазақ дәстүрі бойынша әр адам өзінің жеті буын бабасын білуге тиіс. Бұл туыстық байланысты сақтап, некені реттеуде маңызды рөл атқарады.',
            },
          },
        ],
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
