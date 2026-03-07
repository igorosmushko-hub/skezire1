import type { Metadata } from 'next';
import { ProfilePageClient } from './ProfilePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';

  return {
    title: isKk ? 'Жеке кабинет | Шежіре' : 'Личный кабинет | Шежіре',
    robots: { index: false },
    alternates: { canonical: `https://skezire.kz/${locale}/profile` },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ProfilePageClient locale={locale} />;
}
