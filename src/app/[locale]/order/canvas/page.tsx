import type { Metadata } from 'next';
import { OrderCanvasClient } from './OrderCanvasClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/order/canvas`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'AI фотоны холстқа басу — Картина тапсырыс беру | Шежіре'
      : 'Печать AI-фото на холсте — Заказать картину | Шежіре',
    description: isKk
      ? 'AI-фотоңызды холстқа немесе постерге басып алыңыз. Қазақстан бойынша жеткізу. Постер, холст, рамадағы холст.'
      : 'Закажите печать вашего AI-фото на холсте или постере с доставкой по Казахстану. Постер, холст, холст в рамке.',
    keywords: isKk
      ? 'картина тапсырыс беру, AI фото басу, холст, постер, шежіре, жеткізу'
      : 'заказать картину, печать AI фото, холст, постер, шежіре, доставка Казахстан',
    openGraph: {
      type: 'website',
      title: isKk ? 'Картина тапсырыс беру | Шежіре' : 'Заказать картину | Шежіре',
      description: isKk
        ? 'AI-фотоңызды холстқа басып, Қазақстан бойынша жеткізу.'
        : 'Печать AI-фото на холсте с доставкой по Казахстану.',
      url,
      siteName: 'Шежіре',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Шежіре — Заказать картину' }],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/order/canvas`,
        ru: `${base}/ru/order/canvas`,
        'x-default': `${base}/kk/order/canvas`,
      },
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
