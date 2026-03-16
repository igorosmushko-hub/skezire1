'use client';

interface ZhuzStat {
  zhuzId: string;
  name_kk: string;
  name_ru: string;
  memberCount: number;
}

interface Props {
  zhuzStats: ZhuzStat[];
  totalUsers: number;
  locale: string;
}

export function ZhuzRaceCards({ zhuzStats, totalUsers, locale }: Props) {
  const isKk = locale === 'kk';
  const maxCount = Math.max(...zhuzStats.map((z) => z.memberCount), 1);

  return (
    <div>
      <h2 className="lb-zhuz-title">{isKk ? 'Жүздер жарысы' : 'Гонка жузов'}</h2>
      <div className="lb-zhuz-grid">
        {zhuzStats.map((zhuz) => {
          const pct = totalUsers > 0 ? Math.round((zhuz.memberCount / totalUsers) * 100) : 0;
          const barWidth = Math.max(5, Math.round((zhuz.memberCount / maxCount) * 100));

          return (
            <div key={zhuz.zhuzId} className={`lb-zhuz-card lb-zhuz-card--${zhuz.zhuzId}`}>
              <div className="lb-zhuz-card-top">
                <span className="lb-zhuz-card-name">{isKk ? zhuz.name_kk : zhuz.name_ru}</span>
                <span className="lb-zhuz-card-pct">{pct}%</span>
              </div>
              <div className={`lb-zhuz-bar lb-zhuz-bar--${zhuz.zhuzId}`}>
                <div
                  className={`lb-zhuz-bar-fill lb-zhuz-bar-fill--${zhuz.zhuzId}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="lb-zhuz-card-count">
                {zhuz.memberCount.toLocaleString()} {isKk ? 'мүше' : 'уч.'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
