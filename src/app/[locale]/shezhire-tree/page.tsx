import { useTranslations } from 'next-intl';
import { InteractiveTree } from '@/components/tribe-tree/InteractiveTree';
import type { Metadata } from 'next';
import '@/styles/tribe-race.css';

export const metadata: Metadata = {
  title: 'Шежіре ағашы — Алаш, жүздер, рулар | Skezire',
  description:
    'Интерактивті шежіре ағашы: Алаш → Ұлы жүз, Орта жүз, Кіші жүз → 47 ру. Руыңызға қосылыңыз және жарысқа қатысыңыз!',
};

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
