import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TRIBES_DB } from '@/data/tribes';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { TribeDetail } from '@/components/encyclopedia/TribeDetail';
import { AiPromoBanner } from '@/components/AiPromoBanner';
import { AiInlineHint } from '@/components/AiInlineHint';
import '@/styles/encyclopedia.css';

interface PageProps {
  params: Promise<{ locale: string; zhuzId: string; tribeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, zhuzId, tribeId } = await params;
  const isKk = locale === 'kk';

  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  const tribe = zhuz?.tribes.find((t) => t.id === tribeId);
  if (!zhuz || !tribe) return {};

  const tribeName = isKk ? tribe.kk : tribe.ru;
  const zhuzName = isKk ? zhuz.kk : zhuz.ru;

  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/encyclopedia/${zhuzId}/${tribeId}`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: `${tribeName} — ${zhuzName} | Шежіре`,
    description: isKk ? tribe.desc_kk : tribe.desc_ru,
    keywords: isKk
      ? `${tribeName}, ${zhuzName}, тамға, ұран, шежіре, қазақ руы`
      : `${tribeName}, ${zhuzName}, тамга, уран, шежіре, казахский род`,
    openGraph: {
      type: 'website',
      title: `${tribeName} — ${zhuzName} | Шежіре`,
      description: isKk ? tribe.desc_kk : tribe.desc_ru,
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: tribeName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tribeName} | Шежіре`,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/encyclopedia/${zhuzId}/${tribeId}`,
        ru: `${base}/ru/encyclopedia/${zhuzId}/${tribeId}`,
        'x-default': `${base}/kk/encyclopedia/${zhuzId}/${tribeId}`,
      },
    },
  };
}

export default async function TribePage({ params }: PageProps) {
  const { locale, zhuzId, tribeId } = await params;
  const t = await getTranslations({ locale, namespace: 'enc' });
  const isKk = locale === 'kk';

  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  const tribeIndex = zhuz?.tribes.findIndex((tr) => tr.id === tribeId) ?? -1;
  if (!zhuz || tribeIndex === -1) notFound();
  const tribe = zhuz.tribes[tribeIndex];

  const zhuzName = isKk ? zhuz.kk : zhuz.ru;
  const tribeName = isKk ? tribe.kk : tribe.ru;
  const subgroup = isKk ? tribe.subgroup_kk : tribe.subgroup_ru;

  const prevTribe = tribeIndex > 0 ? zhuz.tribes[tribeIndex - 1] : undefined;
  const nextTribe = tribeIndex < zhuz.tribes.length - 1 ? zhuz.tribes[tribeIndex + 1] : undefined;

  const base = 'https://skezire.kz';
  const pageUrl = `${base}/${locale}/encyclopedia/${zhuzId}/${tribeId}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKk ? 'Басты бет' : 'Главная', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'Энциклопедия' : 'Энциклопедия', item: `${base}/${locale}/encyclopedia` },
      { '@type': 'ListItem', position: 3, name: zhuzName, item: `${base}/${locale}/encyclopedia/${zhuzId}` },
      { '@type': 'ListItem', position: 4, name: tribeName, item: pageUrl },
    ],
  };

  const region = isKk ? tribe.region_kk : tribe.region_ru;

  const personJsonLd = tribe.notable.length > 0
    ? tribe.notable.map((p) => ({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: p.name,
        description: isKk ? p.role_kk : p.role_ru,
        memberOf: {
          '@type': 'Organization',
          name: tribeName,
        },
      }))
    : [];

  const placeJsonLd = region
    ? {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: region,
        description: isKk
          ? `${tribeName} руының тарихи мекені`
          : `Историческое место проживания рода ${tribeName}`,
      }
    : null;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: tribeName,
    description: isKk ? tribe.desc_kk : tribe.desc_ru,
    url: pageUrl,
    datePublished: '2026-02-27',
    dateModified: '2026-03-03',
    inLanguage: locale === 'kk' ? 'kk-KZ' : 'ru-RU',
    author: {
      '@type': 'Organization',
      name: 'Шежіре',
      url: base,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Шежіре',
      url: base,
    },
    image: `${base}/${locale}/opengraph-image`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Шежіре',
      url: base,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {personJsonLd.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      )}
      {placeJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }} />
      )}
      {/* Breadcrumb bar */}
      <div className="tribe-breadcrumb-bar">
        <div className="container">
          <Breadcrumb
            items={[
              { label: t('breadcrumbHome'), href: `/${locale}` },
              { label: t('breadcrumbEnc'), href: `/${locale}/encyclopedia` },
              { label: zhuzName, href: `/${locale}/encyclopedia/${zhuz.id}` },
              { label: tribeName },
            ]}
          />
        </div>
      </div>

      {/* Article card */}
      <main className="enc-main">
        <div className="container">
          <TribeDetail
            tribe={tribe}
            locale={locale}
            zhuzName={zhuzName}
            labels={{
              tamga: t('tribeTamga'),
              uran: t('tribeUran'),
              region: t('tribeRegion'),
              subgroup: t('tribeSubgroup'),
              notable: t('tribeNotable'),
            }}
          />

          <AiInlineHint slug="ancestor" locale={locale} />

          {/* Siblings — other tribes in this zhuz */}
          {zhuz.tribes.length > 1 && (
            <section className="tribe-siblings">
              <h2 className="tribe-siblings-title">
                {isKk ? `${zhuzName} — басқа рулар` : `Другие роды ${zhuzName}`}
              </h2>
              <div className="tribe-siblings-grid">
                {zhuz.tribes
                  .filter((tr) => tr.id !== tribeId)
                  .slice(0, 5)
                  .map((tr) => (
                    <a key={tr.id} href={`/${locale}/encyclopedia/${zhuz.id}/${tr.id}`} className="tribe-sib-card">
                      <span className="tribe-sib-tamga">{tr.tamga}</span>
                      <span className="tribe-sib-name">{isKk ? tr.kk : tr.ru}</span>
                    </a>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <AiPromoBanner locale={locale} features={['ancestor', 'past']} variant="history" />
    </>
  );
}
