'use client';

import Link from 'next/link';
import { useTribeStats } from '@/hooks/useTribeStats';
import { findTribe } from '@/lib/tribe-utils';

const MEDALS = ['🥇', '🥈', '🥉'];

export function LeaderboardTeaser({ locale }: { locale: string }) {
  const isKk = locale === 'kk';
  const { data, loading } = useTribeStats(60000);

  if (loading || !data || data.totalUsers === 0) return null;

  const top5 = [...data.tribes]
    .sort((a, b) => b.member_count - a.member_count)
    .slice(0, 5);

  return (
    <section className="lb-teaser">
      <div className="lb-teaser-container">
        <div className="lb-teaser-header">
          <h2>{isKk ? 'Рулар жарысы' : 'Гонка родов'}</h2>
          <p>
            {isKk
              ? `${data.totalUsers.toLocaleString()} қазақ қосылды — руыңыз қай орында?`
              : `${data.totalUsers.toLocaleString()} казахов присоединились — где ваш род?`}
          </p>
        </div>

        <div className="lb-teaser-list">
          {top5.map((tribe, i) => {
            const found = findTribe(tribe.tribe_id);
            const tribeName = found ? (isKk ? found.tribe.kk : found.tribe.ru) : tribe.tribe_id;

            return (
              <div key={tribe.tribe_id} className="lb-teaser-row">
                <span className="lb-teaser-pos">{i < 3 ? MEDALS[i] : `${i + 1}`}</span>
                <span className="lb-teaser-tamga">{found?.tribe.tamga}</span>
                <span className="lb-teaser-name">{tribeName}</span>
                <span className="lb-teaser-count">{tribe.member_count.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        <div className="lb-teaser-cta">
          <Link href={`/${locale}/leaderboard`} className="lb-cta-btn">
            {isKk ? 'Толық рейтинг →' : 'Полный рейтинг →'}
          </Link>
        </div>
      </div>
    </section>
  );
}
