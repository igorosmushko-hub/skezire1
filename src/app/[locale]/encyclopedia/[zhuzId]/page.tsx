import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TRIBES_DB } from '@/data/tribes';
import { ZhuzSection } from '@/components/encyclopedia/ZhuzSection';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { Pager } from '@/components/encyclopedia/Pager';
import '@/styles/encyclopedia.css';

interface PageProps {
  params: Promise<{ locale: string; zhuzId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, zhuzId } = await params;
  const isKk = locale === 'kk';
  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  if (!zhuz) return {};

  const name = isKk ? zhuz.kk : zhuz.ru;
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/encyclopedia/${zhuzId}`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? `${name} — ${zhuz.tribes.length} ру | Шежіре Энциклопедия`
      : `${name} — ${zhuz.tribes.length} родов | Шежіре Энциклопедия`,
    description: isKk ? zhuz.desc_kk : zhuz.desc_ru,
    openGraph: {
      type: 'website',
      title: isKk
        ? `${name} — ${zhuz.tribes.length} ру | Шежіре`
        : `${name} — ${zhuz.tribes.length} родов | Шежіре`,
      description: isKk ? zhuz.desc_kk : zhuz.desc_ru,
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? `${name} | Шежіре` : `${name} | Шежіре`,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/encyclopedia/${zhuzId}`,
        ru: `${base}/ru/encyclopedia/${zhuzId}`,
      },
    },
  };
}

export default async function ZhuzPage({ params }: PageProps) {
  const { locale, zhuzId } = await params;
  const t = await getTranslations({ locale, namespace: 'enc' });
  const isKk = locale === 'kk';

  const zhuzIndex = TRIBES_DB.findIndex((z) => z.id === zhuzId);
  if (zhuzIndex === -1) notFound();
  const zhuz = TRIBES_DB[zhuzIndex];

  const name = isKk ? zhuz.kk : zhuz.ru;
  const desc = isKk ? zhuz.desc_kk : zhuz.desc_ru;

  const prevZhuz = zhuzIndex > 0 ? TRIBES_DB[zhuzIndex - 1] : undefined;
  const nextZhuz = zhuzIndex < TRIBES_DB.length - 1 ? TRIBES_DB[zhuzIndex + 1] : undefined;

  const base = 'https://skezire.kz';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isKk ? 'Басты бет' : 'Главная', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'Энциклопедия' : 'Энциклопедия', item: `${base}/${locale}/encyclopedia` },
      { '@type': 'ListItem', position: 3, name, item: `${base}/${locale}/encyclopedia/${zhuzId}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="enc-hero enc-hero--compact">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: t('breadcrumbHome'), href: `/${locale}` },
              { label: t('breadcrumbEnc'), href: `/${locale}/encyclopedia` },
              { label: name },
            ]}
          />
          <h1 className="enc-hero-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>{name}</h1>
          <p className="enc-hero-sub">{desc}</p>
        </div>
      </section>

      <Pager
        prev={prevZhuz ? { label: isKk ? prevZhuz.kk : prevZhuz.ru, href: `/encyclopedia/${prevZhuz.id}` } : undefined}
        next={nextZhuz ? { label: isKk ? nextZhuz.kk : nextZhuz.ru, href: `/encyclopedia/${nextZhuz.id}` } : undefined}
        prevLabel={t('pagerPrev')}
        nextLabel={t('pagerNext')}
        locale={locale}
      />

      <ZhuzSection
        zhuz={zhuz}
        locale={locale}
        tribesHeading={t('tribesHeading')}
        moreLabel={t('tribeMore')}
        tribeTabsLabels={{
          tamga: t('tribeTamga'),
          uran: t('tribeUran'),
          region: t('tribeRegion'),
          subgroup: t('tribeSubgroup'),
          notable: t('tribeNotable'),
          moreLink: t('tribeMore'),
        }}
      />

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
