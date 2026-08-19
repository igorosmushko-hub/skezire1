'use client';

import { useEffect, useRef, useState } from 'react';
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const loginTriggerRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isKk = locale === 'kk';
  const tribeName = isKk ? tribe.kk : tribe.ru;
  const zhuzName = isKk ? zhuz.kk : zhuz.ru;

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    closeButtonRef.current?.focus();
    return () => previousFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!showLogin) onClose();
        return;
      }
      if (event.key !== 'Tab' || showLogin) return;

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showLogin]);

  useEffect(() => {
    if (!showLogin) return;
    document.querySelector<HTMLElement>('.modal[data-login-modal="true"] .modal-close')?.focus();
  }, [showLogin]);

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
      <div
        className="join-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
        aria-hidden={showLogin}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="join-close"
          aria-label={isKk ? 'Жабу' : 'Закрыть'}
        >
          &times;
        </button>

        <div className="join-tamga">{tribe.tamga}</div>

        <h3 id="join-modal-title" className="join-tribe-name">{tribeName}</h3>
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

        {showLogin && (
          <LoginModal
            open={true}
            onClose={() => {
              setShowLogin(false);
              loginTriggerRef.current?.focus();
            }}
          />
        )}

        {!user ? (
          <button ref={loginTriggerRef} onClick={() => setShowLogin(true)} className="join-btn">
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
