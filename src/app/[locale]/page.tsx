import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { OrnamentDivider } from '@/components/OrnamentDivider';
import { FormTreeContainer } from '@/components/FormTreeContainer';
import { AiSection } from '@/components/AiSection';
import { AiShowcase } from '@/components/AiShowcase';
import { FamilyPortraitCta } from '@/components/FamilyPortraitCta';
import { TribeRaceSection } from '@/components/TribeRaceSection';
import '@/styles/tribe-race-section.css';

import { JsonLd } from '@/components/JsonLd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Шежіре — Қазақша шежіре ағашы онлайн | AI фото, Жеті ата, 47 ру'
      : 'Шежіре — Казахское генеалогическое дерево онлайн | AI фото, 7 поколений, 47 родов',
    description: isKk
      ? 'Шежіре — қазақ ата-тегінің онлайн ағашы. Жеті атаңызды біліңіз, руыңызды анықтаңыз, шежіре ағашын жасаңыз. AI фото трансформация — 3 тегін генерация. Шежіре постерін холстқа басып алыңыз.'
      : 'Шежіре — казахское генеалогическое дерево онлайн. Узнайте свой род, жуз и семь поколений предков. Создайте шежіре дерево. AI фото трансформация — 3 бесплатные генерации. Закажите постер на холсте.',
    keywords: isKk
      ? 'шежіре, қазақ руы, жеті ата, жүз, ру, генеалогия, ата-тек, AI фото, шежіре ағашы, қазақ тарихы'
      : 'шежіре, шежире, казахское генеалогическое дерево, казахские роды, жузы, жеті ата, генеалогия казахов, AI фото, родословная',
    openGraph: {
      type: 'website',
      title: isKk ? 'Шежіре — Қазақша шежіре ағашы онлайн' : 'Шежіре — Казахское генеалогическое дерево онлайн',
      description: isKk
        ? 'Жеті атаңызды біліңіз, руыңызды анықтаңыз. AI фото — 3 тегін генерация. Постер холстқа.'
        : 'Узнайте свой род и 7 поколений предков. AI фото — 3 бесплатные генерации. Постер на холсте.',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Шежіре — казахское генеалогическое дерево' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Шежіре — Қазақша шежіре ағашы онлайн' : 'Шежіре — Казахское генеалогическое дерево онлайн',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk`,
        ru: `${base}/ru`,
        'x-default': `${base}/kk`,
      },
    },
  };
}

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <>
      <JsonLd locale={locale} />
      <Hero />
      <AiShowcase />
      <TribeRaceSection locale={locale} />
      <About />
      <OrnamentDivider />
      <FormTreeContainer locale={locale} />
      <AiSection />
      <FamilyPortraitCta />
    </>
  );
}
