'use client';

import { findTribe } from '@/lib/tribe-utils';
import { useAuth } from '@/components/AuthProvider';

interface TribeStat {
  tribe_id: string;
  zhuz_id: string;
  member_count: number;
  today_count: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

interface Props {
  tribes: TribeStat[];
  locale: string;
}

export function TribeRanking({ tribes, locale }: Props) {
  const isKk = locale === 'kk';
  const { user } = useAuth();
  const sorted = [...tribes].sort((a, b) => b.member_count - a.member_count);

  return (
    <div>
      <h2 className="lb-rank-title">{isKk ? 'Үздік рулар' : 'Топ родов'}</h2>
      <div className="lb-rank-table">
        <div className="lb-rank-header">
          <span>#</span>
          <span>{isKk ? 'Ру' : 'Род'}</span>
          <span>{isKk ? 'Жүз' : 'Жуз'}</span>
          <span>{isKk ? 'Мүше' : 'Участники'}</span>
          <span>{isKk ? 'Бүгін' : 'Сегодня'}</span>
        </div>
        {sorted.map((tribe, i) => {
          const found = findTribe(tribe.tribe_id);
          const isUserTribe = user?.tribeId === tribe.tribe_id;
          const tribeName = found ? (isKk ? found.tribe.kk : found.tribe.ru) : tribe.tribe_id;
          const zhuzName = found ? (isKk ? found.zhuz.kk : found.zhuz.ru) : tribe.zhuz_id;

          return (
            <div
              key={tribe.tribe_id}
              className={`lb-rank-row ${isUserTribe ? 'lb-rank-row--mine' : ''}`}
            >
              <span className="lb-rank-pos">{i < 3 ? MEDALS[i] : i + 1}</span>
              <div className="lb-rank-tribe">
                <span className="lb-rank-tamga">{found?.tribe.tamga}</span>
                <span className="lb-rank-name">
                  {tribeName}
                  {isUserTribe && (
                    <span className="lb-rank-you">{isKk ? '(сіз)' : '(вы)'}</span>
                  )}
                </span>
              </div>
              <span className="lb-rank-zhuz">{zhuzName}</span>
              <span className="lb-rank-members">{tribe.member_count.toLocaleString()}</span>
              <span className={`lb-rank-today ${tribe.today_count > 0 ? 'lb-rank-today--plus' : 'lb-rank-today--zero'}`}>
                {tribe.today_count > 0 ? `+${tribe.today_count}` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
