import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import '@/styles/zheti-ata.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/zheti-ata`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Жеті ата — Қазақтың жеті буын дәстүрі | Шежіре'
      : 'Жеті ата — Традиция семи предков у казахов | Шежіре',
    description: isKk
      ? 'Жеті ата деген не? Қазақ дәстүрі бойынша жеті буын бабаңызды білу — неке, ру, тамға, тайпалық біртұтастық. Толық түсіндірме.'
      : 'Что такое жеті ата? Казахская традиция знать семь поколений предков — экзогамия, род, тамга, единство племени. Полное объяснение.',
    keywords: isKk
      ? 'жеті ата, жеті буын, қазақ дәстүрі, экзогамия, шежіре, ата-тек, ру, жүз'
      : 'жеті ата, семь предков, казахская традиция, экзогамия, шежіре, генеалогия, род, жуз',
    openGraph: {
      type: 'article',
      title: isKk ? 'Жеті ата — Қазақтың жеті буын дәстүрі' : 'Жеті ата — Традиция семи предков у казахов',
      description: isKk
        ? 'Неге әр қазақ жеті атасын білуі керек? Толық түсіндірме.'
        : 'Почему каждый казах должен знать семь предков? Полное объяснение.',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Жеті ата' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Жеті ата — Жеті буын дәстүрі' : 'Жеті ата — Семь предков',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/zheti-ata`,
        ru: `${base}/ru/zheti-ata`,
        'x-default': `${base}/kk/zheti-ata`,
      },
    },
  };
}

export default async function ZhetiAtaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'zhetiAta' });
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKk ? 'Шежіре' : 'Шежіре', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'Жеті ата' : 'Жеті ата', item: `${base}/${locale}/zheti-ata` },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: isKk ? 'Жеті ата — Қазақтың жеті буын дәстүрі' : 'Жеті ата — Традиция семи предков у казахов',
    description: isKk
      ? 'Жеті ата деген не? Қазақ дәстүрі бойынша жеті буын бабаңызды білу.'
      : 'Что такое жеті ата? Казахская традиция знать семь поколений предков.',
    inLanguage: isKk ? 'kk' : 'ru',
    publisher: { '@type': 'Organization', name: 'Шежіре', url: `${base}/` },
    mainEntityOfPage: `${base}/${locale}/zheti-ata`,
  };

  const generations = [
    { num: 1, kk: 'Әке', ru: 'Отец', descKk: 'Сіздің әкеңіз — бірінші буын', descRu: 'Ваш отец — первое поколение' },
    { num: 2, kk: 'Ата', ru: 'Дед', descKk: 'Атаңыз — екінші буын', descRu: 'Ваш дедушка — второе поколение' },
    { num: 3, kk: 'Арғы ата', ru: 'Прадед', descKk: 'Арғы атаңыз — үшінші буын', descRu: 'Ваш прадед — третье поколение' },
    { num: 4, kk: 'Баба', ru: 'Прапрадед', descKk: 'Бабаңыз — төртінші буын', descRu: 'Ваш прапрадед — четвёртое поколение' },
    { num: 5, kk: 'Түп ата', ru: 'Пра-прапрадед', descKk: 'Түп атаңыз — бесінші буын', descRu: 'Пятое поколение' },
    { num: 6, kk: 'Тек ата', ru: 'Шестой предок', descKk: 'Тек атаңыз — алтыншы буын', descRu: 'Шестое поколение' },
    { num: 7, kk: 'Жеті ата', ru: 'Седьмой предок', descKk: 'Жеті ата — жетінші буын, рудың түпкі бабасы', descRu: 'Седьмое поколение — корень рода' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Hero */}
      <section className="enc-hero">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: isKk ? 'Шежіре' : 'Шежіре', href: `/${locale}` },
              { label: t('title') },
            ]}
          />
          <h1 className="enc-hero-title">{t('title')}</h1>
          <p className="enc-hero-sub">{t('subtitle')}</p>
        </div>
      </section>

      {/* Content */}
      <main className="za-main">
        <div className="container">
          {/* Intro */}
          <section className="za-section">
            <h2 className="za-h2">{t('whatTitle')}</h2>
            <p className="za-text">{t('whatText1')}</p>
            <p className="za-text">{t('whatText2')}</p>
          </section>

          {/* 7 generations */}
          <section className="za-section">
            <h2 className="za-h2">{t('generationsTitle')}</h2>
            <p className="za-text">{t('generationsIntro')}</p>
            <div className="za-gen-list">
              {generations.map((g) => (
                <div key={g.num} className="za-gen-item">
                  <div className="za-gen-num">{g.num}</div>
                  <div className="za-gen-info">
                    <div className="za-gen-name">{isKk ? g.kk : g.ru}</div>
                    <div className="za-gen-desc">{isKk ? g.descKk : g.descRu}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why important */}
          <section className="za-section">
            <h2 className="za-h2">{t('whyTitle')}</h2>
            <div className="za-cards">
              <div className="za-card">
                <div className="za-card-icon">👨‍👩‍👧‍👦</div>
                <h3 className="za-card-title">{t('why1Title')}</h3>
                <p className="za-card-text">{t('why1Text')}</p>
              </div>
              <div className="za-card">
                <div className="za-card-icon">🤝</div>
                <h3 className="za-card-title">{t('why2Title')}</h3>
                <p className="za-card-text">{t('why2Text')}</p>
              </div>
              <div className="za-card">
                <div className="za-card-icon">📜</div>
                <h3 className="za-card-title">{t('why3Title')}</h3>
                <p className="za-card-text">{t('why3Text')}</p>
              </div>
              <div className="za-card">
                <div className="za-card-icon">🧬</div>
                <h3 className="za-card-title">{t('why4Title')}</h3>
                <p className="za-card-text">{t('why4Text')}</p>
              </div>
            </div>
          </section>

          {/* Exogamy */}
          <section className="za-section">
            <h2 className="za-h2">{t('exogamyTitle')}</h2>
            <p className="za-text">{t('exogamyText1')}</p>
            <p className="za-text">{t('exogamyText2')}</p>
            <blockquote className="za-quote">
              <p>{t('exogamyQuote')}</p>
              <cite>{t('exogamyCite')}</cite>
            </blockquote>
          </section>

          {/* How to learn */}
          <section className="za-section">
            <h2 className="za-h2">{t('howTitle')}</h2>
            <ol className="za-steps">
              <li>{t('how1')}</li>
              <li>{t('how2')}</li>
              <li>{t('how3')}</li>
              <li>{t('how4')}</li>
              <li>{t('how5')}</li>
            </ol>
          </section>
        </div>
      </main>

      {/* CTA */}
      <section className="enc-cta">
        <div className="container">
          <h3>{t('ctaTitle')}</h3>
          <p>{t('ctaDesc')}</p>
          <a href={`/${locale}#form-section`} className="btn btn-primary">{t('ctaBtn')}</a>
        </div>
      </section>
    </>
  );
}
