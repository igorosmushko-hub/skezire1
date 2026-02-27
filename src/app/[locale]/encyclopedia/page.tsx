import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { TRIBES_DB } from '@/data/tribes';
import { HubCard } from '@/components/encyclopedia/HubCard';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import '@/styles/encyclopedia.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isKk = locale === 'kk';
  return {
    title: isKk
      ? 'Қазақ рулары энциклопедиясы | Шежіре'
      : 'Энциклопедия казахских родов | Шежіре',
    description: isKk
      ? 'Ұлы, Орта, Кіші жүз және Жүзден тыс — 47 рудың толық тарихы'
      : 'Старший, Средний, Младший жуз и Вне жузов — полная история 47 родов',
  };
}

export default async function EncyclopediaPage() {
  const locale = await getLocale();
  const t = await getTranslations('enc');

  const totalTribes = TRIBES_DB.reduce((sum, z) => sum + z.tribes.length, 0);

  return (
    <main style={{ paddingTop: 80 }}>
      <div className="container">
        <Breadcrumb
          items={[
            { label: t('breadcrumbHome'), href: '/' },
            { label: t('breadcrumbEnc') },
          ]}
        />

        <div className="section-header" style={{ marginTop: 24 }}>
          <div className="orn-line" />
          <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: '2rem', color: 'var(--blue)', whiteSpace: 'nowrap' }}>
            {t('hubTitle')}
          </h1>
          <div className="orn-line" />
        </div>
        <p className="section-desc">
          {totalTribes} {t('tribesCount')} — {t('hubSub')}
        </p>

        <div className="hub-grid">
          {TRIBES_DB.map((zhuz) => (
            <HubCard key={zhuz.id} zhuz={zhuz} locale={locale} />
          ))}
        </div>
      </div>
    </main>
  );
}
