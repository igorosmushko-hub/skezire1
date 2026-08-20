import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TRIBES_DB } from '@/data/tribes';
import { ZhuzSection } from '@/components/encyclopedia/ZhuzSection';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { Pager } from '@/components/encyclopedia/Pager';
import Link from 'next/link';
import { AiPromoBanner } from '@/components/AiPromoBanner';
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
    keywords: isKk
      ? `${name}, рулары, шежіре, тамға, ұран, қазақ рулары энциклопедия`
      : `${name}, роды, шежіре, тамга, уран, энциклопедия казахских родов`,
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
        'x-default': `${base}/kk/encyclopedia/${zhuzId}`,
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

      <section style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 40px' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#003082', marginBottom: 12 }}>
          {isKk ? 'Пайдалы сілтемелер' : 'Полезные ссылки'}
        </h3>
        <ul style={{ lineHeight: 1.8, paddingLeft: 20, color: '#444' }}>
          <li><Link href={`/${locale}/glossary`} style={{ color: '#003082' }}>{isKk ? 'Глоссарий — шежіре терминдері' : 'Глоссарий — термины шежіре'}</Link></li>
          <li><Link href={`/${locale}/blog/how-to-find-your-tribe`} style={{ color: '#003082' }}>{isKk ? 'Руыңды қалай білуге болады?' : 'Как узнать свой род?'}</Link></li>
          <li><Link href={`/${locale}/blog/zheti-ata-seven-ancestors`} style={{ color: '#003082' }}>{isKk ? 'Жеті ата — 7 буын дәстүрі' : 'Жеті ата — традиция 7 поколений'}</Link></li>
          <li><Link href={`/${locale}`} style={{ color: '#003082' }}>{isKk ? 'Шежіре ағашын жасау — тегін' : 'Создать генеалогическое дерево — бесплатно'}</Link></li>
        </ul>
      </section>

      <AiPromoBanner locale={locale} features={['past', 'ancestor', 'action-figure']} variant="history" />
    </>
  );
}
