import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TRIBES_DB } from '@/data/tribes';
import { EncTabs } from '@/components/encyclopedia/EncTabs';
import { AiPromoBanner } from '@/components/AiPromoBanner';
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
    keywords: isKk
      ? 'қазақ рулары, энциклопедия, жүз, ру, тамға, ұран, шежіре, Ұлы жүз, Орта жүз, Кіші жүз'
      : 'казахские роды, энциклопедия, жуз, род, тамга, уран, шежіре, Старший жуз, Средний жуз, Младший жуз',
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

  // ItemList schema for hub page — helps Google display rich snippets
  let position = 0;
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isKk ? 'Қазақ рулары энциклопедиясы' : 'Энциклопедия казахских родов',
    url: `${base}/${locale}/encyclopedia`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: TRIBES_DB.flatMap((zhuz) =>
        zhuz.tribes.map((tribe) => ({
          '@type': 'ListItem',
          position: ++position,
          name: isKk ? tribe.kk : tribe.ru,
          url: `${base}/${locale}/encyclopedia/${zhuz.id}/${tribe.id}`,
        })),
      ),
    },
  };

  // Filter to main 3 zhuzes for tabs (exclude "other")
  const mainZhuzes = TRIBES_DB.filter((z) => z.id !== 'other');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      {/* Hero */}
      <section className="enc-hero enc-hero--hub">
        <div className="enc-hero-content">
          <span className="enc-overline">{isKk ? 'ҚАЗАҚ ЭНЦИКЛОПЕДИЯСЫ' : 'КАЗАҚ ЭНЦИКЛОПЕДИЯСЫ'}</span>
          <h1 className="enc-hero-title">{t('hubTitle')}</h1>
          <p className="enc-hero-sub">{t('hubSub')}</p>
        </div>
      </section>

      {/* Tabs + Content */}
      <EncTabs
        zhuzes={mainZhuzes}
        locale={locale}
        moreLabel={t('openZhuz')}
      />

      {/* Related sections */}
      <section className="enc-related">
        <div className="container">
          <div className="enc-related-grid">
            <a href={`/${locale}/glossary`} className="enc-related-card">
              <span className="enc-related-icon">&#128214;</span>
              <h3>{isKk ? 'Глоссарий' : 'Глоссарий'}</h3>
              <p>{isKk ? 'Шежіре, жүз, ру, тамға, ұран — негізгі терминдер' : 'Шежіре, жуз, ру, тамга, уран — основные термины'}</p>
            </a>
            <a href={`/${locale}/blog`} className="enc-related-card">
              <span className="enc-related-icon">&#128240;</span>
              <h3>{isKk ? 'Блог' : 'Блог'}</h3>
              <p>{isKk ? 'Қазақ тарихы мен мәдениеті туралы мақалалар' : 'Статьи о казахской истории и культуре'}</p>
            </a>
          </div>
        </div>
      </section>

      <AiPromoBanner locale={locale} features={['past', 'ancestor']} variant="history" />
    </>
  );
}
