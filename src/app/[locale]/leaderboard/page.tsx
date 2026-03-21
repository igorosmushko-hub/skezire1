import type { Metadata } from 'next';
import { LeaderboardClient } from './LeaderboardClient';
import '@/styles/tribe-race.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isKk = locale === 'kk';
  const base = 'https://skezire.kz';
  const url = `${base}/${locale}/leaderboard`;
  const ogImage = `${base}/${locale}/opengraph-image`;

  return {
    title: isKk
      ? 'Рулар жарысы — Гонка родов | Шежіре'
      : 'Гонка родов — Рейтинг казахских родов | Шежіре',
    description: isKk
      ? 'Жүздер мен рулар арасындағы жарыс. Руыңызға қосылыңыз, рейтингті көріңіз, туыстарыңызды шақырыңыз!'
      : 'Соревнование между казахскими родами. Присоединяйтесь к своему роду, смотрите рейтинг, приглашайте родственников!',
    openGraph: {
      type: 'website',
      title: isKk ? 'Рулар жарысы — Гонка родов' : 'Гонка родов — Рейтинг казахских родов',
      description: isKk
        ? 'Руыңызға қосылыңыз, рейтингті көріңіз!'
        : 'Присоединяйтесь к своему роду, смотрите рейтинг!',
      url,
      siteName: 'Шежіре',
      locale: isKk ? 'kk_KZ' : 'ru_RU',
      images: [{ url: ogImage, width: 1200, height: 630, alt: isKk ? 'Рулар жарысы' : 'Гонка родов' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isKk ? 'Рулар жарысы — Гонка родов' : 'Гонка родов — Рейтинг казахских родов',
      images: [ogImage],
    },
    alternates: {
      canonical: url,
      languages: {
        kk: `${base}/kk/leaderboard`,
        ru: `${base}/ru/leaderboard`,
        'x-default': `${base}/kk/leaderboard`,
      },
    },
  };
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LeaderboardClient locale={locale} />;
}
