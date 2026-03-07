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
    title: isKk ? 'Картина тапсырыс беру | Шежіре' : 'Заказать картину | Шежіре',
    description: isKk
      ? 'AI-фотоңызды холстқа басып, Қазақстан бойынша жеткізу'
      : 'Закажите печать вашего AI-фото на холсте с доставкой по Казахстану',
    robots: { index: false },
    alternates: {
      canonical: `${base}/${locale}/order/canvas`,
    },
  };
}

export default async function OrderCanvasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <OrderCanvasClient locale={locale} />;
}

import { OrderCanvasClient } from './OrderCanvasClient';
