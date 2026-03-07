import type { Metadata } from 'next';
import { FamilyPortraitClient } from './FamilyPortraitClient';
import '@/styles/family-portrait.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/ai/family-portrait/create`;

  return {
    title: isKk
      ? 'Отбасылық портрет жасау | Шежіре'
      : 'Создать семейный портрет | Шежіре',
    description: isKk
      ? 'AI нейросетімен отбасылық портрет жасаңыз — фото жүктеңіз, фон таңдаңыз, портрет алыңыз.'
      : 'Создайте семейный портрет с помощью AI — загрузите фото, выберите фон, получите портрет.',
    robots: { index: false },
    alternates: { canonical: url },
  };
}

export default async function FamilyPortraitCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <FamilyPortraitClient locale={locale} />;
}
