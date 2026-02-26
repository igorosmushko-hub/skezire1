import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { TRIBES_DB } from '@/data/tribes';
import { ZhuzSection } from '@/components/encyclopedia/ZhuzSection';
import '@/styles/encyclopedia.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isKk = locale === 'kk';
  return {
    title: isKk
      ? 'Қазақ рулары — 47 ру тарихы | Шежіре Энциклопедия'
      : 'Казахские роды — история 47 родов | Шежіре Энциклопедия',
    description: isKk
      ? 'Барлық қазақ руларының толық анықтамалығы: тамға, ұран, тарих, атақты тұлғалар'
      : 'Полный справочник всех казахских родов: тамга, уран, история, известные представители',
  };
}

export default async function EncyclopediaPage() {
  const locale = await getLocale();
  const t = await getTranslations('enc');
  const isKk = locale === 'kk';

  const totalTribes = TRIBES_DB.reduce((sum, z) => sum + z.tribes.length, 0);

  return (
    <main style={{ paddingTop: 80 }}>
      <div className="container">
        <div className="section-header" style={{ marginTop: 40 }}>
          <div className="orn-line" />
          <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: '2rem', color: 'var(--blue)', whiteSpace: 'nowrap' }}>
            {t('subtitle')} — {totalTribes} {t('tribesCount')}
          </h1>
          <div className="orn-line" />
        </div>
        <p className="section-desc">{t('desc')}</p>

        {/* Quick nav */}
        <nav className="enc-quick-nav" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
          {TRIBES_DB.map((zhuz) => (
            <a
              key={zhuz.id}
              href={`#zhuz-${zhuz.id}`}
              className="btn btn-outline"
              style={{ padding: '8px 20px', fontSize: '.85rem' }}
            >
              {isKk ? zhuz.kk : zhuz.ru}
            </a>
          ))}
        </nav>

        {TRIBES_DB.map((zhuz) => (
          <ZhuzSection key={zhuz.id} zhuz={zhuz} locale={locale} />
        ))}
      </div>
    </main>
  );
}
