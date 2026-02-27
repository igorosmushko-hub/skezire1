import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TRIBES_DB } from '@/data/tribes';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { TribeDetail } from '@/components/encyclopedia/TribeDetail';
import { Pager } from '@/components/encyclopedia/Pager';
import '@/styles/encyclopedia.css';

interface PageProps {
  params: Promise<{ locale: string; zhuzId: string; tribeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, zhuzId, tribeId } = await params;
  const isKk = locale === 'kk';

  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  const tribe = zhuz?.tribes.find((t) => t.id === tribeId);
  if (!zhuz || !tribe) return {};

  const tribeName = isKk ? tribe.kk : tribe.ru;
  const zhuzName = isKk ? zhuz.kk : zhuz.ru;

  return {
    title: `${tribeName} — ${zhuzName} | Шежіре`,
    description: isKk ? tribe.desc_kk : tribe.desc_ru,
  };
}

export default async function TribePage({ params }: PageProps) {
  const { locale, zhuzId, tribeId } = await params;
  const t = await getTranslations({ locale, namespace: 'enc' });
  const isKk = locale === 'kk';

  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  const tribeIndex = zhuz?.tribes.findIndex((tr) => tr.id === tribeId) ?? -1;
  if (!zhuz || tribeIndex === -1) notFound();
  const tribe = zhuz.tribes[tribeIndex];

  const zhuzName = isKk ? zhuz.kk : zhuz.ru;
  const tribeName = isKk ? tribe.kk : tribe.ru;
  const subgroup = isKk ? tribe.subgroup_kk : tribe.subgroup_ru;

  const prevTribe = tribeIndex > 0 ? zhuz.tribes[tribeIndex - 1] : undefined;
  const nextTribe = tribeIndex < zhuz.tribes.length - 1 ? zhuz.tribes[tribeIndex + 1] : undefined;

  return (
    <>
      <section className="enc-hero enc-hero--compact">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: t('breadcrumbHome'), href: `/${locale}` },
              { label: t('breadcrumbEnc'), href: `/${locale}/encyclopedia` },
              { label: zhuzName, href: `/${locale}/encyclopedia/${zhuz.id}` },
              { label: tribeName },
            ]}
          />
          <h1 className="enc-hero-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>{tribeName}</h1>
          <p className="enc-hero-sub">{zhuzName}{subgroup ? ` — ${subgroup}` : ''}</p>
        </div>
      </section>

      <Pager
        prev={prevTribe ? { label: isKk ? prevTribe.kk : prevTribe.ru, href: `/encyclopedia/${zhuz.id}/${prevTribe.id}` } : undefined}
        next={nextTribe ? { label: isKk ? nextTribe.kk : nextTribe.ru, href: `/encyclopedia/${zhuz.id}/${nextTribe.id}` } : undefined}
        prevLabel={t('pagerPrev')}
        nextLabel={t('pagerNext')}
        locale={locale}
      />

      <main className="enc-main">
        <div className="container">
          <TribeDetail
            tribe={tribe}
            locale={locale}
            labels={{
              tamga: t('tribeTamga'),
              uran: t('tribeUran'),
              region: t('tribeRegion'),
              subgroup: t('tribeSubgroup'),
              notable: t('tribeNotable'),
            }}
          />
        </div>
      </main>

      <section className="enc-cta">
        <div className="container">
          <h3>{t('ctaTitle')}</h3>
          <p>{t('ctaDesc')}</p>
          <a href={`/${locale}#form-section`} className="btn btn-primary">{t('ctaBtn')}</a>
        </div>
      </section>
    </>
  );
}
