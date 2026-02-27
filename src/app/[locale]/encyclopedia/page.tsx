import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TRIBES_DB } from '@/data/tribes';
import { HubCard } from '@/components/encyclopedia/HubCard';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import '@/styles/encyclopedia.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
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

export default async function EncyclopediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'enc' });

  return (
    <>
      {/* Hero */}
      <section className="enc-hero">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: t('breadcrumbHome'), href: `/${locale}` },
              { label: t('breadcrumbEnc') },
            ]}
          />
          <h1 className="enc-hero-title">{t('hubTitle')}</h1>
          <p className="enc-hero-sub">{t('hubSub')}</p>
        </div>
      </section>

      {/* Main */}
      <main className="enc-main">
        <div className="container">
          <div className="hub-grid">
            {TRIBES_DB.map((zhuz) => (
              <HubCard
                key={zhuz.id}
                zhuz={zhuz}
                locale={locale}
                tribesWord={t('tribesWord')}
                openLabel={t('openZhuz')}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
