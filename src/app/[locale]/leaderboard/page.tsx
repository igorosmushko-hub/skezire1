import type { Metadata } from 'next';
import { LeaderboardClient } from './LeaderboardClient';
import '@/styles/tribe-race.css';

export const metadata: Metadata = {
  title: 'Рулар жарысы — Гонка родов | Skezire',
  description:
    'Жүздер мен рулар арасындағы жарыс. Руыңызға қосылыңыз, рейтингті көріңіз, туыстарыңызды шақырыңыз!',
};

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LeaderboardClient locale={locale} />;
}
