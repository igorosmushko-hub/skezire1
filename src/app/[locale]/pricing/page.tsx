import type { Metadata } from 'next';
import { PricingPageClient } from './PricingPageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/pricing`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'AI фото генерация тарифтері — Бағалар | Шежіре'
      : 'Тарифы AI фото-генераций — Цены | Шежіре',
    description: isKk
      ? 'AI фото генерация пакеттері: Starter, Standard, Premium. Экшн-фигурка, Гибли стилі, 100 жыл бұрынғы фото, питомецті адамға айналдыру. 3 тегін генерация + ақылы пакеттер.'
      : 'Пакеты AI фото-генераций: Starter, Standard, Premium. Экшн-фигурка, стиль Гибли, фото 100 лет назад, питомец в человека. 3 бесплатные генерации + платные пакеты.',
    keywords: isKk
      ? 'AI фото бағасы, нейросеть фото бағасы, шежіре тариф, фото генерация пакет'
      : 'AI фото цена, нейросеть фото цена, шежіре тариф, пакет генераций',
    openGraph: {
      type: 'website',
      title: isKk ? 'AI фото генерация тарифтері' : 'Тарифы AI фото-генераций',
      description: isKk
        ? '3 тегін генерация + ақылы пакеттер. Экшн-фигурка, Гибли, 100 жыл бұрынғы фото.'
        : '3 бесплатные генерации + платные пакеты. Экшн-фигурка, Гибли, фото 100 лет назад.',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: isKk ? 'AI тарифтер' : 'AI тарифы' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'AI фото генерация тарифтері' : 'Тарифы AI фото-генераций',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/pricing`,
        ru: `${base}/ru/pricing`,
        'x-default': `${base}/kk/pricing`,
      },
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Шежіре AI',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      url: `https://skezire.kz/${locale}/pricing`,
      description: isKk
        ? 'AI фото трансформация: экшн-фигурка, Гибли стилі, ата-баба фотосы, питомецті адамға айналдыру'
        : 'AI фото трансформация: экшн-фигурка, стиль Гибли, фото предка, питомец в человека',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'KZT',
        lowPrice: '0',
        offerCount: '3',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isKk ? 'Басты бет' : 'Главная', item: `https://skezire.kz/${locale}` },
        { '@type': 'ListItem', position: 2, name: isKk ? 'Тарифтер' : 'Тарифы', item: `https://skezire.kz/${locale}/pricing` },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PricingPageClient locale={locale} />
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 60px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 16, color: '#003082' }}>
          {isKk ? 'AI фото генерация — қалай жұмыс істейді?' : 'AI фото-генерация — как это работает?'}
        </h2>
        <p style={{ lineHeight: 1.7, color: '#444', marginBottom: 16 }}>
          {isKk
            ? 'Шежіре AI — қазақстандық нейросеть платформасы. Фотоңызды жүктеңіз, стильді таңдаңыз — нейросеть бірнеше секундта нәтижені дайындайды. Экшн-фигурка, Гибли стилі, 100 жыл бұрынғы фото, питомецті адамға айналдыру, отбасылық портрет — барлығы бір жерде.'
            : 'Шежіре AI — казахстанская платформа нейросетей. Загрузите фото, выберите стиль — нейросеть подготовит результат за несколько секунд. Экшн-фигурка, стиль Гибли, фото 100 лет назад, питомец в человека, семейный портрет — всё в одном месте.'}
        </p>
        <h3 style={{ fontSize: '1.2rem', marginBottom: 12, color: '#003082' }}>
          {isKk ? 'Не кіреді?' : 'Что входит?'}
        </h3>
        <ul style={{ lineHeight: 1.8, color: '#444', paddingLeft: 20 }}>
          <li>{isKk ? '3 тегін генерация — тіркелгеннен кейін бірден' : '3 бесплатные генерации — сразу после регистрации'}</li>
          <li>{isKk ? '6 AI стиль: экшн-фигурка, Гибли, ата-баба, питомец, отбасылық портрет, арт' : '6 AI стилей: экшн-фигурка, Гибли, предок, питомец, семейный портрет, арт'}</li>
          <li>{isKk ? 'Жоғары сапалы нәтиже — жүктеп алуға болады' : 'Высокое качество — можно скачать результат'}</li>
          <li>{isKk ? 'Төлем Robokassa арқылы — қауіпсіз' : 'Оплата через Robokassa — безопасно'}</li>
        </ul>
      </section>
    </>
  );
}
