import { useTranslations } from 'next-intl';
import { InteractiveTree } from '@/components/tribe-tree/InteractiveTree';
import type { Metadata } from 'next';
import '@/styles/tribe-race.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/shezhire-tree`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Шежіре ағашы — Алаш, жүздер, 47 ру | Шежіре'
      : 'Дерево шежіре — Алаш, жузы, 47 родов | Шежіре',
    description: isKk
      ? 'Интерактивті шежіре ағашы: Алаш → Ұлы жүз, Орта жүз, Кіші жүз → 47 ру. Руыңызды тауып, қосылыңыз және жарысқа қатысыңыз!'
      : 'Интерактивное дерево шежіре: Алаш → Старший, Средний, Младший жуз → 47 родов. Найдите свой род и присоединяйтесь!',
    openGraph: {
      type: 'website',
      title: isKk ? 'Шежіре ағашы — Алаш, жүздер, 47 ру' : 'Дерево шежіре — Алаш, жузы, 47 родов',
      description: isKk
        ? 'Интерактивті шежіре ағашы: Алаш → Жүздер → 47 ру'
        : 'Интерактивное дерево шежіре: Алаш → Жузы → 47 родов',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: isKk ? 'Шежіре ағашы' : 'Дерево шежіре' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Шежіре ағашы — Алаш, жүздер, 47 ру' : 'Дерево шежіре — Алаш, жузы, 47 родов',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/shezhire-tree`,
        ru: `${base}/ru/shezhire-tree`,
        'x-default': `${base}/kk/shezhire-tree`,
      },
    },
  };
}

export default async function ShezhireTreePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ highlight?: string }>;
}) {
  const { locale } = await params;
  const { highlight } = await searchParams;

  return <ShezhireTreeView locale={locale} highlightTribeId={highlight} />;
}

function ShezhireTreeView({ locale, highlightTribeId }: { locale: string; highlightTribeId?: string }) {
  const t = useTranslations('tribe');
  const isKk = locale === 'kk';

  return (
    <main className="tr-page">
      <div className="tr-container">
        <div className="tr-header">
          <h1>{t('tribeTree')}</h1>
          <p>
            {isKk
              ? 'Алаш → Жүздер → Рулар. Руыңызды тауып, қосылыңыз!'
              : 'Алаш → Жузы → Роды. Найдите свой род и присоединяйтесь!'}
          </p>
        </div>

        <InteractiveTree locale={locale} highlightTribeId={highlightTribeId} />
      </div>
    </main>
  );
}
