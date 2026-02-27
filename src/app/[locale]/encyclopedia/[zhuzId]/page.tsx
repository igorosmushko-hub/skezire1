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

  // Pager: prev/next zhuz
  const prevZhuz = zhuzIndex > 0 ? TRIBES_DB[zhuzIndex - 1] : undefined;
  const nextZhuz = zhuzIndex < TRIBES_DB.length - 1 ? TRIBES_DB[zhuzIndex + 1] : undefined;

  return (
    <main style={{ paddingTop: 80 }}>
      <div className="container">
        <Breadcrumb
          items={[
            { label: t('breadcrumbHome'), href: '/' },
            { label: t('breadcrumbEnc'), href: '/encyclopedia' },
            { label: name },
          ]}
        />

        <ZhuzSection zhuz={zhuz} locale={locale} />

        <Pager
          prev={
            prevZhuz
              ? {
                  label: isKk ? prevZhuz.kk : prevZhuz.ru,
                  href: `/encyclopedia/${prevZhuz.id}`,
                }
              : undefined
          }
          next={
            nextZhuz
              ? {
                  label: isKk ? nextZhuz.kk : nextZhuz.ru,
                  href: `/encyclopedia/${nextZhuz.id}`,
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
