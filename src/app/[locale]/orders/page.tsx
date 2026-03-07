import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';

  return {
    title: isKk ? 'Менің тапсырыстарым | Шежіре' : 'Мои заказы | Шежіре',
    robots: { index: false },
    alternates: { canonical: `https://skezire.kz/${locale}/orders` },
  };
}

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <OrdersPageClient locale={locale} />;
}

import { OrdersPageClient } from './OrdersPageClient';
