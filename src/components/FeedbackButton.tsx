'use client';

import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';

export function FeedbackButton() {
  const locale = useLocale();
  const isKk = locale === 'kk';
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, message }),
      });
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setName('');
        setContact('');
        setMessage('');
      }, 2500);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }, [name, contact, message, sending]);

  return (
    <>
      {/* Floating button */}
      <button
        className="fb-floating-btn"
        onClick={() => setOpen(true)}
        aria-label={isKk ? 'Сұрақ қою' : 'Задать вопрос'}
      >
        💬
      </button>

      {/* Modal */}
      {open && (
        <div className="fb-overlay" onClick={() => !sending && setOpen(false)}>
          <div className="fb-modal" onClick={(e) => e.stopPropagation()}>
            <button className="fb-close" onClick={() => setOpen(false)}>&times;</button>

            {sent ? (
              <div className="fb-sent">
                <span className="fb-sent-icon">✅</span>
                <p>{isKk ? 'Хабарламаңыз жіберілді!' : 'Сообщение отправлено!'}</p>
              </div>
            ) : (
              <>
                <h3 className="fb-title">
                  {isKk ? 'Сұрағыңызды жазыңыз' : 'Задайте свой вопрос'}
                </h3>
                <p className="fb-desc">
                  {isKk
                    ? 'Біз сізге тез арада жауап береміз'
                    : 'Мы ответим вам в ближайшее время'}
                </p>

                <input
                  className="fb-input"
                  type="text"
                  placeholder={isKk ? 'Аты-жөніңіз' : 'Ваше имя'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
                <input
                  className="fb-input"
                  type="text"
                  placeholder={isKk ? 'Телефон немесе Telegram' : 'Телефон или Telegram'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  maxLength={100}
                />
                <textarea
                  className="fb-textarea"
                  placeholder={isKk ? 'Сұрағыңыз...' : 'Ваш вопрос...'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
                <button
                  className="fb-submit"
                  onClick={handleSubmit}
                  disabled={!message.trim() || sending}
                >
                  {sending
                    ? '...'
                    : isKk ? 'Жіберу' : 'Отправить'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
