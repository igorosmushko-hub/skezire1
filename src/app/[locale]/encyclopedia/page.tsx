import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TRIBES_DB } from '@/data/tribes';
import { HubCard } from '@/components/encyclopedia/HubCard';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import '@/styles/encyclopedia.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/encyclopedia`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Қазақ рулары энциклопедиясы | Шежіре'
      : 'Энциклопедия казахских родов | Шежіре',
    description: isKk
      ? 'Ұлы, Орта, Кіші жүз және Жүзден тыс — 47 рудың толық тарихы мен шежіресі. Казақ рулары туралы толық мәлімет.'
      : 'Старший, Средний, Младший жуз и Вне жузов — полная история 47 казахских родов. Происхождение, тамга, уран, известные люди.',
    openGraph: {
      type: 'website',
      title: isKk ? 'Қазақ рулары энциклопедиясы | Шежіре' : 'Энциклопедия казахских родов | Шежіре',
      description: isKk
        ? 'Ұлы, Орта, Кіші жүз және Жүзден тыс — 47 рудың толық тарихы.'
        : 'Полная история 47 казахских родов: происхождение, тамга, уран, известные люди.',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Шежіре — Энциклопедия казахских родов' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Қазақ рулары энциклопедиясы | Шежіре' : 'Энциклопедия казахских родов | Шежіре',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/encyclopedia`,
        ru: `${base}/ru/encyclopedia`,
        'x-default': `${base}/kk/encyclopedia`,
      },
    },
  };
}

export default async function EncyclopediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'enc' });
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKk ? 'Басты бет' : 'Главная', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'Энциклопедия' : 'Энциклопедия', item: `${base}/${locale}/encyclopedia` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Hero */}
      <section className="enc-hero">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: t('breadcrumbHome'), href: `/${locale}` },
              { label: t('breadcrumbEnc') },
            ]}
          />
          <h1 className="enc-hero-title">{t('hubTitle')}</h1>
          <p className="enc-hero-sub">{t('hubSub')}</p>
        </div>
      </section>

      {/* Main */}
      <main className="enc-main">
        <div className="container">
          <div className="hub-grid">
            {TRIBES_DB.map((zhuz) => (
              <HubCard
                key={zhuz.id}
                zhuz={zhuz}
                locale={locale}
                tribesWord={t('tribesWord')}
                openLabel={t('openZhuz')}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
