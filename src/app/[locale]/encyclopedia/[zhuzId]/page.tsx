import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { TRIBES_DB } from '@/data/tribes';
import { ZhuzSection } from '@/components/encyclopedia/ZhuzSection';
import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { Pager } from '@/components/encyclopedia/Pager';
import '@/styles/encyclopedia.css';

export function generateStaticParams() {
  return TRIBES_DB.map((z) => ({ zhuzId: z.id }));
}

interface PageProps {
  params: Promise<{ zhuzId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { zhuzId } = await params;
  const locale = await getLocale();
  const isKk = locale === 'kk';
  const zhuz = TRIBES_DB.find((z) => z.id === zhuzId);
  if (!zhuz) return {};

  const name = isKk ? zhuz.kk : zhuz.ru;
  return {
    title: isKk
      ? `${name} — ${zhuz.tribes.length} ру | Шежіре Энциклопедия`
      : `${name} — ${zhuz.tribes.length} родов | Шежіре Энциклопедия`,
    description: isKk ? zhuz.desc_kk : zhuz.desc_ru,
  };
}

export default async function ZhuzPage({ params }: PageProps) {
  const { zhuzId } = await params;
  const locale = await getLocale();
  const t = await getTranslations('enc');
  const isKk = locale === 'kk';

  const zhuzIndex = TRIBES_DB.findIndex((z) => z.id === zhuzId);
  if (zhuzIndex === -1) notFound();
  const zhuz = TRIBES_DB[zhuzIndex];

  const name = isKk ? zhuz.kk : zhuz.ru;
  const desc = isKk ? zhuz.desc_kk : zhuz.desc_ru;

  // Pager: prev/next zhuz
  const prevZhuz = zhuzIndex > 0 ? TRIBES_DB[zhuzIndex - 1] : undefined;
  const nextZhuz = zhuzIndex < TRIBES_DB.length - 1 ? TRIBES_DB[zhuzIndex + 1] : undefined;

  return (
    <>
      {/* Compact Hero */}
      <section className="enc-hero enc-hero--compact">
        <div className="enc-hero-bg" />
        <div className="enc-hero-content">
          <Breadcrumb
            items={[
              { label: t('breadcrumbHome'), href: `/${locale}` },
              { label: t('breadcrumbEnc'), href: `/${locale}/encyclopedia` },
              { label: name },
            ]}
          />
          <h1 className="enc-hero-title" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}>{name}</h1>
          <p className="enc-hero-sub">{desc}</p>
        </div>
      </section>

      {/* Pager top */}
      <Pager
        prev={
          prevZhuz
            ? { label: isKk ? prevZhuz.kk : prevZhuz.ru, href: `/encyclopedia/${prevZhuz.id}` }
            : undefined
        }
        next={
          nextZhuz
            ? { label: isKk ? nextZhuz.kk : nextZhuz.ru, href: `/encyclopedia/${nextZhuz.id}` }
            : undefined
        }
      />

      {/* Tribes */}
      <ZhuzSection zhuz={zhuz} locale={locale} />

      {/* CTA */}
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
