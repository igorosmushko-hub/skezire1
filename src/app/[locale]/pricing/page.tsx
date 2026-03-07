import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';

  return {
    title: isKk ? 'AI генерация тарифтері | Шежіре' : 'Тарифы AI генераций | Шежіре',
    description: isKk
      ? 'AI фото генерация пакеттерін сатып алыңыз — Шежіре'
      : 'Купите пакет AI фото-генераций — Шежіре',
    alternates: {
      canonical: `${base}/${locale}/pricing`,
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
  return <PricingPageClient locale={locale} />;
}

import { PricingPageClient } from './PricingPageClient';
