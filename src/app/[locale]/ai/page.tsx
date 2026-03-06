import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { AI_FEATURES } from '@/data/ai-features';
import '@/styles/ai-landing.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/ai`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'AI фото трансформация тегін онлайн — Нейросеть | Шежіре'
      : 'AI фото трансформация бесплатно онлайн — Нейросеть | Шежіре',
    description: isKk
      ? 'AI нейросеть фото трансформация тегін: экшн-фигурка жасау, питомецті адамға айналдыру, Гибли стилі, 100 жыл бұрынғы сурет, бабаңды жасарту. Онлайн, тіркелусіз.'
      : 'Обработка фото нейросетью бесплатно онлайн: экшн-фигурка из фото, питомец в человека, стиль Гибли, фото 100 лет назад, омоложение предка. Без регистрации.',
    keywords: isKk
      ? 'AI фото, нейросеть фото тегін, экшн-фигурка, питомец адамға, Гибли стилі, фото трансформация, ретро фото, шежіре'
      : 'нейросеть фото бесплатно, AI фото онлайн, экшн-фигурка из фото, питомец в человека, стиль Гибли, фото 100 лет назад, омоложение фото нейросеть, шежіре',
    openGraph: {
      type: 'website',
      title: isKk ? 'AI Мүмкіндіктері | Шежіре' : 'AI Функции | Шежіре',
      description: isKk
        ? 'AI фото трансформация: экшн-фигурка, питомец, Гибли, ретро. Тегін онлайн.'
        : 'AI фото трансформация: экшн-фигурка, питомец, Гибли, ретро. Бесплатно онлайн.',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'AI Шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'AI Мүмкіндіктері | Шежіре' : 'AI Функции | Шежіре',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/ai`,
        ru: `${base}/ru/ai`,
        'x-default': `${base}/kk/ai`,
      },
    },
  };
}

export default async function AiHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Шежіре', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'AI Мүмкіндіктері' : 'AI Функции', item: `${base}/${locale}/ai` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isKk ? 'AI фото трансформация құралдары' : 'AI инструменты фото трансформации',
    itemListElement: AI_FEATURES.map((f, i) => {
      const hero = isKk ? f.hero.kk : f.hero.ru;
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: hero.h1,
        url: `${base}/${locale}/ai/${f.slug}`,
      };
    }),
  };

  const webAppJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Шежіре AI',
    description: isKk
      ? 'AI фото трансформация құралдары: экшн-фигурка, питомец адамға, Гибли стилі'
      : 'AI инструменты фото трансформации: экшн-фигурка, питомец в человека, стиль Гибли',
    url: `${base}/${locale}/ai`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KZT' },
    publisher: { '@type': 'Organization', name: 'Шежіре', url: base },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }} />

      <section className="ai-landing-hero">
        <div className="ai-landing-hero-content">
          <Breadcrumb
            items={[
              { label: 'Шежіре', href: `/${locale}` },
              { label: isKk ? 'AI Мүмкіндіктері' : 'AI Функции' },
            ]}
          />
          <h1>{isKk ? 'AI фото трансформация — тегін онлайн' : 'AI фото трансформация — бесплатно онлайн'}</h1>
          <p className="ai-landing-hero-sub">
            {isKk
              ? 'Жасанды интеллект арқылы суретіңізді трансформациялаңыз — тегін, онлайн'
              : 'Трансформируйте фото с помощью AI — бесплатно, онлайн'}
          </p>
        </div>
      </section>

      <main className="ai-landing-main">
        <div className="container">
          <div className="ai-related-grid" style={{ marginBottom: 48 }}>
            {AI_FEATURES.map((f) => {
              const hero = isKk ? f.hero.kk : f.hero.ru;
              const seo = isKk ? f.seo.kk : f.seo.ru;
              return (
                <Link
                  key={f.slug}
                  href={`/${locale}/ai/${f.slug}`}
                  className="ai-related-card"
                >
                  <div className="ai-related-card-icon">{f.icon}</div>
                  <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: '1.1rem', color: 'var(--blue)', marginBottom: 8 }}>
                    {hero.h1}
                  </h2>
                  <p>{seo.description.slice(0, 100)}...</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* SEO content section */}
      <section className="ai-seo-section">
        <div className="container">
          {isKk ? (
            <>
              <h2>AI нейросеть арқылы фото трансформация — тегін онлайн</h2>
              <p>
                <strong>Шежіре</strong> — қазақ мәдениетіне арналған AI фото трансформация платформасы.
                Біздің нейросеть суретіңізді бірнеше секундта өңдеп, бірегей нәтиже береді.
                Тіркелусіз, ақысыз, кез-келген құрылғыда жұмыс істейді.
              </p>

              <h3>Қандай AI мүмкіндіктер бар?</h3>

              <h4>🕰️ 100 жыл бұрынғы суретіңіз</h4>
              <p>
                AI нейросеті сіздің суретіңізді 1920 жылдардағы қазақ даласы стилінде қайта жасайды.
                Дәстүрлі шапан, тымақ, сепия реңктері — нағыз тарихи портрет. Ретро фото жасау
                бұрын-соңды болмағандай оңай.
              </p>

              <h4>👵 Бабаңды жасарту</h4>
              <p>
                Ата-бабаңыздың ескі суретін жүктеңіз — AI оны жасартып, жас кезіндегі бейнесін
                көрсетеді. Ақ-қара суреттер де жарайды. Отбасылық тарихты жаңа қырынан көріңіз.
              </p>

              <h4>🎯 Экшн-фигурка жасау</h4>
              <p>
                Суретіңізден коллекциялық экшн-фигурка жасаңыз — қазақ ұлттық киімінде, блистер
                қорапта. Домбыра, бүркіт, қылыш аксессуарларымен. Достарыңызға жіберіп, таңқалдырыңыз!
              </p>

              <h4>🐾 Питомецті адамға айналдыру</h4>
              <p>
                Мысық, ит, құс — кез-келген жануарды жүктеңіз. AI оны қазақ батыры немесе ханшайым
                стилінде адам бейнесіне айналдырады. Жануарыңыздың ерекшеліктері сақталады.
              </p>

              <h4>🎌 Гибли стиліндегі сурет</h4>
              <p>
                Studio Ghibli аниме стилінде сурет жасаңыз — қазақ даласы, киіз үй, жылқылар фонымен.
                Хаяо Миядзаки стилі мен қазақ мәдениетінің бірегей үйлесімі.
              </p>

              <h3>Неліктен Шежіре AI?</h3>
              <ul>
                <li><strong>Толығымен тегін</strong> — тіркелусіз, жасырын төлемсіз</li>
                <li><strong>Жылдам нәтиже</strong> — 10-15 секундта дайын</li>
                <li><strong>Қазақ мәдениеті</strong> — ұлттық ою-өрнек, дәстүрлі киім, тарих</li>
                <li><strong>Мобильді нұсқа</strong> — телефон, планшет, компьютерде жұмыс істейді</li>
                <li><strong>Сапалы AI</strong> — заманауи нейросеть технологиялары</li>
              </ul>
            </>
          ) : (
            <>
              <h2>AI фото трансформация нейросетью — бесплатно онлайн</h2>
              <p>
                <strong>Шежіре</strong> — платформа для AI фото трансформации с казахским колоритом.
                Наша нейросеть обрабатывает фото за секунды и создаёт уникальные результаты.
                Без регистрации, без оплаты, на любом устройстве.
              </p>

              <h3>Какие AI-инструменты доступны?</h3>

              <h4>🕰️ Фото 100 лет назад</h4>
              <p>
                AI нейросеть воссоздаёт ваш образ в стиле 1920-х годов казахской степи.
                Традиционный шапан, тымак, тона сепии — настоящий исторический портрет.
                Создать ретро фото через нейросеть ещё никогда не было так просто.
              </p>

              <h4>👵 Омоложение предка</h4>
              <p>
                Загрузите старое фото бабушки или дедушки — AI нейросеть омолодит лицо
                и покажет, как они выглядели в молодости. Подходят даже чёрно-белые и выцветшие
                снимки. Омоложение фото нейросетью — способ заглянуть в прошлое семьи.
              </p>

              <h4>🎯 Экшн-фигурка из фото</h4>
              <p>
                Превратите своё фото в коллекционную экшн-фигурку в казахском национальном
                костюме. Шапан, домбра, беркут — в блистерной упаковке. Сделать фигурку
                нейросетью по фото — новый тренд, и у нас это бесплатно.
              </p>

              <h4>🐾 Питомец в человека</h4>
              <p>
                Загрузите фото кота, собаки или любого питомца — AI нейросеть превратит
                его в человека в стиле казахского батыра. Окрас, глаза и характер животного
                сохраняются. Превратить питомца в человека через нейросеть — популярный тренд
                в соцсетях.
              </p>

              <h4>🎌 Фото в стиле Гибли</h4>
              <p>
                Нейросеть превратит ваше фото в аниме-иллюстрацию в стиле Studio Ghibli
                с казахской степью на фоне. Мягкие акварельные тона Хаяо Миядзаки и казахская
                культура — стиль Гибли фото бесплатно, без регистрации.
              </p>

              <h3>Почему Шежіре AI?</h3>
              <ul>
                <li><strong>Полностью бесплатно</strong> — без регистрации и скрытых платежей</li>
                <li><strong>Быстрый результат</strong> — готово за 10-15 секунд</li>
                <li><strong>Казахская культура</strong> — национальные орнаменты, традиционная одежда, история</li>
                <li><strong>Мобильная версия</strong> — работает на телефоне, планшете и компьютере</li>
                <li><strong>Качественный AI</strong> — современные технологии нейросетей</li>
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="ai-bottom-cta">
        <div className="container">
          <h3>{isKk ? 'Шежіреңізді жасаңыз' : 'Создайте своё шежіре'}</h3>
          <p>{isKk ? 'Ата-тегіңіздің тарихын сақтаңыз' : 'Сохраните историю своего рода'}</p>
          <Link href={`/${locale}#form-section`} className="btn-hero">
            {isKk ? 'Шежіре жасау' : 'Создать шежіре'}
          </Link>
        </div>
      </section>
    </>
  );
}
