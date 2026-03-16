'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { LoginModal } from '@/components/LoginModal';
import type { Tribe, Zhuz } from '@/lib/types';

interface Props {
  tribe: Tribe;
  zhuz: Zhuz;
  locale: string;
  onClose: () => void;
  onJoined: () => void;
}

export function TribeJoinModal({ tribe, zhuz, locale, onClose, onJoined }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const isKk = locale === 'kk';
  const tribeName = isKk ? tribe.kk : tribe.ru;
  const zhuzName = isKk ? zhuz.kk : zhuz.ru;

  const handleJoin = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tribe/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zhuzId: zhuz.id, tribeId: tribe.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'cooldown') {
          setError(isKk
            ? 'Руды 30 күнде 1 рет ауыстыруға болады'
            : 'Род можно менять 1 раз в 30 дней');
        } else if (data.error === 'already_in_tribe') {
          setError(isKk ? 'Сіз осы руда тіркелгенсіз' : 'Вы уже в этом роду');
        } else {
          setError(isKk ? 'Қате орын алды' : 'Произошла ошибка');
        }
        return;
      }

      onJoined();
    } catch {
      setError(isKk ? 'Қате орын алды' : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-overlay" onClick={onClose}>
      <div className="join-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="join-close">&times;</button>

        <div className="join-tamga">{tribe.tamga}</div>

        <h3 className="join-tribe-name">{tribeName}</h3>
        <p className="join-zhuz-name">{zhuzName}</p>

        <div className="join-info">
          <p>{isKk ? tribe.desc_kk : tribe.desc_ru}</p>
          {tribe.uran && (
            <p><span className="join-info-label">{isKk ? 'Ұран' : 'Уран'}:</span> {tribe.uran}</p>
          )}
          <p>
            <span className="join-info-label">{isKk ? 'Аймақ' : 'Регион'}:</span>{' '}
            {isKk ? tribe.region_kk : tribe.region_ru}
          </p>
        </div>

        {error && <p className="join-error">{error}</p>}

        {showLogin && <LoginModal open={true} onClose={() => setShowLogin(false)} />}

        {!user ? (
          <button onClick={() => setShowLogin(true)} className="join-btn">
            {isKk ? 'Деректерді толтыру' : 'Заполнить данные'}
          </button>
        ) : user.tribeId === tribe.id ? (
          <p className="join-msg join-msg--ok">
            {isKk ? 'Сіз осы руда тіркелгенсіз ✓' : 'Вы уже в этом роду ✓'}
          </p>
        ) : (
          <button onClick={handleJoin} disabled={loading} className="join-btn">
            {loading
              ? '...'
              : isKk
                ? `${tribeName} руына қосылу`
                : `Присоединиться к роду ${tribeName}`}
          </button>
        )}
      </div>
    </div>
  );
}
