'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTribeStats } from '@/hooks/useTribeStats';
import { findTribe } from '@/lib/tribe-utils';
import { useAuth } from './AuthProvider';

const MEDALS = ['🥇', '🥈', '🥉'];
const ZHUZ_COLORS: Record<string, string> = {
  uly: 'gold',
  orta: 'blue',
  kishi: 'green',
  other: 'purple',
};

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current || started.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function TribeRaceSection({ locale }: { locale: string }) {
  const isKk = locale === 'kk';
  const { data, loading } = useTribeStats(30000);
  const { user } = useAuth();

  if (loading || !data || data.totalUsers === 0) return null;

  const top5 = [...data.tribes]
    .sort((a, b) => b.member_count - a.member_count)
    .slice(0, 5);

  const maxCount = top5[0]?.member_count || 1;

  // Zhuz stats sorted by member count
  const zhuzsSorted = [...data.zhuzStats]
    .filter((z) => z.memberCount > 0)
    .sort((a, b) => b.memberCount - a.memberCount);

  const totalZhuzMembers = zhuzsSorted.reduce((s, z) => s + z.memberCount, 0) || 1;

  // Today's most active tribes
  const todayActive = [...data.tribes]
    .filter((t) => t.today_count > 0)
    .sort((a, b) => b.today_count - a.today_count)
    .slice(0, 3);

  // Find user's tribe rank
  const userTribeId = (user as { tribe_id?: string } | null)?.tribe_id;
  const userTribeRank = userTribeId
    ? [...data.tribes]
        .sort((a, b) => b.member_count - a.member_count)
        .findIndex((t) => t.tribe_id === userTribeId) + 1
    : 0;
  const userTribeInfo = userTribeId ? findTribe(userTribeId) : null;

  const handleShare = async () => {
    const text = isKk
      ? `🏇 Рулар жарысы — ${data.totalUsers} қазақ қосылды!\nРуыңызды тіркеңіз: skezire.kz`
      : `🏇 Гонка родов — ${data.totalUsers} казахов уже участвуют!\nРегистрируй свой род: skezire.kz`;
    if (navigator.share) {
      try {
        await navigator.share({ text, url: 'https://skezire.kz' });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard?.writeText(text);
    }
  };

  return (
    <section className="race-section">
      <div className="race-container">
        {/* Hero counter */}
        <div className="race-hero">
          <div className="race-hero-icon">🏇</div>
          <h2 className="race-hero-title">
            {isKk ? 'Рулар жарысы' : 'Гонка родов'}
          </h2>
          <div className="race-hero-counter">
            <AnimatedCounter target={data.totalUsers} />
          </div>
          <p className="race-hero-label">
            {isKk ? 'қазақ қосылды' : 'казахов присоединились'}
          </p>
          {todayActive.length > 0 && (
            <div className="race-hero-today">
              {isKk ? 'Бүгін: ' : 'Сегодня: '}
              {todayActive.map((t, i) => {
                const found = findTribe(t.tribe_id);
                const name = found ? (isKk ? found.tribe.kk : found.tribe.ru) : t.tribe_id;
                return (
                  <span key={t.tribe_id} className="race-today-item">
                    {i > 0 && ', '}
                    <strong>{name}</strong> +{t.today_count}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* User's tribe badge */}
        {userTribeInfo && userTribeRank > 0 && (
          <div className="race-user-badge">
            <span className="race-user-tamga">{userTribeInfo.tribe.tamga}</span>
            <div className="race-user-info">
              <p className="race-user-name">
                {isKk ? userTribeInfo.tribe.kk : userTribeInfo.tribe.ru}
              </p>
              <p className="race-user-rank">
                {isKk
                  ? `Сіздің руыңыз ${userTribeRank}-орында`
                  : `Ваш род на ${userTribeRank}-м месте`}
              </p>
            </div>
            <span className="race-user-pos">#{userTribeRank}</span>
          </div>
        )}

        {/* Top 5 tribes */}
        <div className="race-top">
          <h3 className="race-section-title">
            {isKk ? '🏆 Топ-5 ру' : '🏆 Топ-5 родов'}
          </h3>
          <div className="race-top-list">
            {top5.map((tribe, i) => {
              const found = findTribe(tribe.tribe_id);
              const tribeName = found ? (isKk ? found.tribe.kk : found.tribe.ru) : tribe.tribe_id;
              const zhuzColor = found ? ZHUZ_COLORS[found.zhuz.id] || 'purple' : 'purple';
              const barWidth = Math.round((tribe.member_count / maxCount) * 100);
              const isUserTribe = tribe.tribe_id === userTribeId;

              return (
                <div
                  key={tribe.tribe_id}
                  className={`race-top-row${isUserTribe ? ' race-top-row--mine' : ''}`}
                >
                  <span className="race-top-pos">
                    {i < 3 ? MEDALS[i] : `${i + 1}`}
                  </span>
                  <span className="race-top-tamga">{found?.tribe.tamga}</span>
                  <div className="race-top-info">
                    <div className="race-top-name-row">
                      <span className="race-top-name">{tribeName}</span>
                      {isUserTribe && (
                        <span className="race-top-you">
                          {isKk ? '← сіз' : '← вы'}
                        </span>
                      )}
                      <span className="race-top-count">
                        {tribe.member_count.toLocaleString()}
                      </span>
                    </div>
                    <div className={`race-top-bar race-top-bar--${zhuzColor}`}>
                      <div
                        className={`race-top-bar-fill race-top-bar-fill--${zhuzColor}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  {tribe.today_count > 0 && (
                    <span className="race-top-today">+{tribe.today_count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Zhuz race */}
        <div className="race-zhuz">
          <h3 className="race-section-title">
            {isKk ? '⚔️ Жүздер жарысы' : '⚔️ Соревнование жузов'}
          </h3>
          <div className="race-zhuz-grid">
            {zhuzsSorted.map((zhuz, i) => {
              const pct = Math.round((zhuz.memberCount / totalZhuzMembers) * 100);
              const color = ZHUZ_COLORS[zhuz.zhuzId] || 'purple';
              return (
                <div key={zhuz.zhuzId} className={`race-zhuz-card race-zhuz-card--${color}`}>
                  {i === 0 && <span className="race-zhuz-leader">👑</span>}
                  <span className="race-zhuz-name">
                    {isKk ? zhuz.name_kk : zhuz.name_ru}
                  </span>
                  <span className="race-zhuz-pct">{pct}%</span>
                  <div className={`race-zhuz-bar race-zhuz-bar--${color}`}>
                    <div
                      className={`race-zhuz-bar-fill race-zhuz-bar-fill--${color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="race-zhuz-count">
                    {zhuz.memberCount.toLocaleString()} {isKk ? 'адам' : 'чел.'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="race-cta">
          <h3 className="race-cta-title">
            {isKk
              ? 'Руыңызды көтеріңіз!'
              : 'Поднимите свой род!'}
          </h3>
          <p className="race-cta-desc">
            {isKk
              ? 'Тіркеліңіз, руыңызды таңдаңыз — жарысқа қосылыңыз. Шежіреңізді жасап, PDF-ке сақтаңыз.'
              : 'Зарегистрируйтесь, выберите свой род — вступайте в гонку. Постройте шежіре и сохраните в PDF.'}
          </p>
          <div className="race-cta-buttons">
            <a href="#tree-form" className="race-cta-btn race-cta-btn--primary">
              {isKk ? '🌳 Шежіре жасау' : '🌳 Построить шежіре'}
            </a>
            <Link href={`/${locale}/leaderboard`} className="race-cta-btn race-cta-btn--secondary">
              {isKk ? '📊 Толық рейтинг' : '📊 Полный рейтинг'}
            </Link>
          </div>
          <button className="race-share-btn" onClick={handleShare}>
            {isKk ? '📢 Достарыңызға жіберу' : '📢 Пригласить друзей'}
          </button>
        </div>
      </div>
    </section>
  );
}
