'use client';

import { useTribeStats } from '@/hooks/useTribeStats';
import { useAuth } from '@/components/AuthProvider';
import { LeaderboardHero } from '@/components/leaderboard/LeaderboardHero';
import { ZhuzRaceCards } from '@/components/leaderboard/ZhuzRaceCards';
import { TribeRanking } from '@/components/leaderboard/TribeRanking';
import { findTribe } from '@/lib/tribe-utils';
import Link from 'next/link';

interface Props {
  locale: string;
}

export function LeaderboardClient({ locale }: Props) {
  const isKk = locale === 'kk';
  const { data, loading } = useTribeStats();
  const { user } = useAuth();

  const userTribe = user?.tribeId ? findTribe(user.tribeId) : null;
  const userRank = data?.tribes
    ? [...data.tribes].sort((a, b) => b.member_count - a.member_count).findIndex((t) => t.tribe_id === user?.tribeId) + 1
    : 0;

  return (
    <main className="tr-page">
      <div className="tr-container">
        <div className="tr-header">
          <h1>{isKk ? 'Рулар жарысы' : 'Гонка родов'}</h1>
          <p>
            {isKk
              ? 'Қай жүз жеңеді? Қай ру бірінші болады? Руыңызға қосылып, жарысқа қатысыңыз!'
              : 'Какой жуз победит? Какой род будет первым? Присоединяйтесь к своему роду!'}
          </p>
        </div>

        {loading || !data ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '4px solid #F59E0B', borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : (
          <>
            <LeaderboardHero totalUsers={data.totalUsers} locale={locale} />

            {/* User's tribe badge */}
            {userTribe && userRank > 0 && (
              <div className="lb-user-badge">
                <span className="lb-user-badge-tamga">{userTribe.tribe.tamga}</span>
                <div className="lb-user-badge-info">
                  <p className="lb-user-badge-name">
                    {isKk
                      ? `Сіз ${userTribe.tribe.kk} руынасыз`
                      : `Вы в роду ${userTribe.tribe.ru}`}
                  </p>
                  <p className="lb-user-badge-rank">
                    #{userRank} {isKk ? 'орын' : 'место'}
                  </p>
                </div>
                <ShareButton
                  locale={locale}
                  tribeName={isKk ? userTribe.tribe.kk : userTribe.tribe.ru}
                  rank={userRank}
                  memberCount={
                    data.tribes.find((t) => t.tribe_id === user?.tribeId)?.member_count ?? 0
                  }
                />
              </div>
            )}

            {/* CTA if no tribe */}
            {user && !user.tribeId && (
              <div className="lb-cta">
                <h3>{isKk ? 'Руыңыз әлі таңдалмаған!' : 'Вы ещё не выбрали род!'}</h3>
                <Link href={`/${locale}/shezhire-tree`} className="lb-cta-btn">
                  {isKk ? 'Руды таңдау →' : 'Выбрать род →'}
                </Link>
              </div>
            )}

            {!user && (
              <div className="lb-cta">
                <h3>{isKk ? 'Жарысқа қатысыңыз!' : 'Участвуйте в гонке!'}</h3>
                <p>
                  {isKk
                    ? 'Тіркеліп, руыңызды таңдаңыз — рейтингте көріңіз'
                    : 'Зарегистрируйтесь, выберите род — появитесь в рейтинге'}
                </p>
                <Link href={`/${locale}/shezhire-tree`} className="lb-cta-btn">
                  {isKk ? 'Руды таңдау →' : 'Выбрать род →'}
                </Link>
              </div>
            )}

            <ZhuzRaceCards zhuzStats={data.zhuzStats} totalUsers={data.totalUsers} locale={locale} />
            <TribeRanking tribes={data.tribes} locale={locale} />

            {/* Invite section */}
            <div className="lb-invite">
              <h3>{isKk ? 'Туыстарыңызды шақырыңыз!' : 'Пригласите родственников!'}</h3>
              <p>
                {isKk
                  ? 'Сілтемені жіберіңіз — руыңызды бірінші орынға шығарыңыз'
                  : 'Отправьте ссылку — выведите свой род на первое место'}
              </p>
              <CopyLinkButton locale={locale} tribeId={user?.tribeId} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ShareButton({ locale, tribeName, rank, memberCount }: {
  locale: string; tribeName: string; rank: number; memberCount: number;
}) {
  const isKk = locale === 'kk';
  const handleShare = async () => {
    const text = isKk
      ? `Мен ${tribeName} руынанмын! Біз #${rank} орында — ${memberCount} мүше. Қосыл! https://skezire.kz/${locale}/leaderboard`
      : `Я из рода ${tribeName}! Мы на #${rank} месте — ${memberCount} участников. Присоединяйся! https://skezire.kz/${locale}/leaderboard`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };
  return (
    <button onClick={handleShare} className="lb-share-btn">
      {isKk ? 'Бөлісу' : 'Поделиться'}
    </button>
  );
}

function CopyLinkButton({ locale, tribeId }: { locale: string; tribeId?: string }) {
  const isKk = locale === 'kk';
  const link = tribeId
    ? `https://skezire.kz/${locale}/join/${tribeId}`
    : `https://skezire.kz/${locale}/leaderboard`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    const btn = document.getElementById('copy-link-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = isKk ? 'Көшірілді!' : 'Скопировано!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }
  };

  return (
    <button id="copy-link-btn" onClick={handleCopy} className="lb-invite-btn">
      {isKk ? 'Сілтемені көшіру' : 'Скопировать ссылку'}
    </button>
  );
}
