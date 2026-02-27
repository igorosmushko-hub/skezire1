import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TRIBES_DB } from '@/data/tribes';
import { Link } from '@/i18n/routing';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { TribeDetail } from '@/components/encyclopedia/TribeDetail';
import { Pager } from '@/components/encyclopedia/Pager';
import '@/styles/encyclopedia.css';

export function generateStaticParams() {
  return TRIBES_DB.flatMap((z) =>
    z.tribes.map((t) => ({ zhuzId: z.id, tribeId: t.id }))
  );
}

interface PageProps {
  params: Promise<{ zhuzId: string; tribeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { zhuzId, tribeId } = await params;
  const locale = await getLocale();
  const isKk = locale === 'kk';

  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  const tribe = zhuz?.tribes.find((t) => t.id === tribeId);
  if (!zhuz || !tribe) return {};

  const tribeName = isKk ? tribe.kk : tribe.ru;
  const zhuzName = isKk ? zhuz.kk : zhuz.ru;

  return {
    title: isKk
      ? `${tribeName} — ${zhuzName} | Шежіре Энциклопедия`
      : `${tribeName} — ${zhuzName} | Шежіре Энциклопедия`,
    description: isKk ? tribe.desc_kk : tribe.desc_ru,
  };
}

export default async function TribePage({ params }: PageProps) {
  const { zhuzId, tribeId } = await params;
  const locale = await getLocale();
  const t = await getTranslations('enc');
  const isKk = locale === 'kk';

  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  const tribeIndex = zhuz?.tribes.findIndex((tr) => tr.id === tribeId) ?? -1;
  if (!zhuz || tribeIndex === -1) notFound();
  const tribe = zhuz.tribes[tribeIndex];

  const zhuzName = isKk ? zhuz.kk : zhuz.ru;

  // Pager: prev/next tribe within the same zhuz
  const prevTribe = tribeIndex > 0 ? zhuz.tribes[tribeIndex - 1] : undefined;
  const nextTribe = tribeIndex < zhuz.tribes.length - 1 ? zhuz.tribes[tribeIndex + 1] : undefined;

  return (
    <main style={{ paddingTop: 80 }}>
      <div className="container">
        <Breadcrumb
          items={[
            { label: t('breadcrumbHome'), href: '/' },
            { label: t('breadcrumbEnc'), href: '/encyclopedia' },
            { label: zhuzName, href: `/encyclopedia/${zhuz.id}` },
            { label: isKk ? tribe.kk : tribe.ru },
          ]}
        />

        <TribeDetail tribe={tribe} locale={locale} />

        <Pager
          prev={
            prevTribe
              ? {
                  label: isKk ? prevTribe.kk : prevTribe.ru,
                  href: `/encyclopedia/${zhuz.id}/${prevTribe.id}`,
                }
              : undefined
          }
          next={
            nextTribe
              ? {
                  label: isKk ? nextTribe.kk : nextTribe.ru,
                  href: `/encyclopedia/${zhuz.id}/${nextTribe.id}`,
                }
              : undefined
          }
        />

        {/* CTA */}
        <section className="enc-cta">
          <h2 className="enc-cta-title">{t('ctaTitle')}</h2>
          <p className="enc-cta-desc">{t('ctaDesc')}</p>
          <Link href="/#form-section" className="btn btn-gold enc-cta-btn">
            {t('ctaBtn')}
          </Link>
        </section>
      </div>
    </main>
  );
}
