import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AI_FEATURES, getFeatureBySlug, getOtherFeatures } from '@/data/ai-features';
import { AiLandingHero } from '@/components/ai-landing/AiLandingHero';
import { AiLandingFeatures } from '@/components/ai-landing/AiLandingFeatures';
import { AiLandingHowItWorks } from '@/components/ai-landing/AiLandingHowItWorks';
import { AiLandingFaq } from '@/components/ai-landing/AiLandingFaq';
import { AiLandingRelated } from '@/components/ai-landing/AiLandingRelated';
import { AiLandingCta } from '@/components/ai-landing/AiLandingCta';
import '@/styles/ai-landing.css';

export function generateStaticParams() {
  return AI_FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) return {};

  const isKk = locale === 'kk';
  const seo = isKk ? feature.seo.kk : feature.seo.ru;
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/ai/${slug}`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      type: 'website',
      title: seo.title,
      description: seo.description,
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: seo.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/ai/${slug}`,
        ru: `${base}/ru/ai/${slug}`,
        'x-default': `${base}/kk/ai/${slug}`,
      },
    },
  };
}

export default async function AiFeaturePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) notFound();

  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const related = getOtherFeatures(slug);
  const hero = isKk ? feature.hero.kk : feature.hero.ru;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Шежіре', item: `${base}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isKk ? 'AI Мүмкіндіктері' : 'AI Функции', item: `${base}/${locale}/ai` },
      { '@type': 'ListItem', position: 3, name: hero.h1, item: `${base}/${locale}/ai/${slug}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: feature.faq.map((item) => {
      const faq = isKk ? item.kk : item.ru;
      return {
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      };
    }),
  };

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: hero.h1,
    description: (isKk ? feature.seo.kk : feature.seo.ru).description,
    url: `${base}/${locale}/ai/${slug}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'KZT' },
    publisher: { '@type': 'Organization', name: 'Шежіре', url: base },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />

      <AiLandingHero feature={feature} locale={locale} />

      <main className="ai-landing-main">
        <div className="container">
          <AiLandingFeatures feature={feature} locale={locale} />
          <AiLandingHowItWorks feature={feature} locale={locale} />
          <AiLandingCta featureSlug={feature.slug} locale={locale} />
          <AiLandingFaq feature={feature} locale={locale} />
          <AiLandingRelated features={related} locale={locale} />

          <section style={{ maxWidth: 700, margin: '40px auto 0', padding: '0 0 20px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#003082', marginBottom: 12 }}>
              {isKk ? 'Пайдалы сілтемелер' : 'Полезные ссылки'}
            </h3>
            <ul style={{ lineHeight: 1.8, paddingLeft: 20, color: '#444' }}>
              <li><Link href={`/${locale}/blog/ai-photo-trends-2026`} style={{ color: '#003082' }}>{isKk ? 'AI фото трендтері 2026' : 'Тренды AI фото 2026'}</Link></li>
              <li><Link href={`/${locale}/blog/ai-preserving-shezhire`} style={{ color: '#003082' }}>{isKk ? 'AI шежірені сақтауға қалай көмектеседі' : 'Как AI помогает сохранять шежіре'}</Link></li>
              <li><Link href={`/${locale}/encyclopedia`} style={{ color: '#003082' }}>{isKk ? 'Энциклопедия — 47 қазақ руы' : 'Энциклопедия — 47 казахских родов'}</Link></li>
              <li><Link href={`/${locale}`} style={{ color: '#003082' }}>{isKk ? 'Шежіре ағашын жасау — тегін' : 'Создать генеалогическое дерево — бесплатно'}</Link></li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
