'use client';

import { useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { AI_MODAL } from '@/lib/constants';

interface AiModalProps {
  type: 'past' | 'grandma' | 'story' | null;
  onClose: () => void;
}

export function AiModal({ type, onClose }: AiModalProps) {
  const t = useTranslations('ai');
  const locale = t('btn') ? 'kk' : 'ru'; // detect from translations availability

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (type) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [type, handleKeyDown]);

  if (!type) return null;

  // Get locale from the HTML lang attribute
  const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : 'kk';
  const lang = (htmlLang === 'ru' ? 'ru' : 'kk') as 'kk' | 'ru';
  const content = AI_MODAL[lang][type];

  return (
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Жабу">
          ✕
        </button>
        <div>
          <div className="modal-icon">{content.icon}</div>
          <h2 className="modal-title">{content.title}</h2>
          <p className="modal-text">{content.text}</p>
          <p className="modal-detail">{content.detail}</p>
          <div className="modal-chip">
            ⏳ {t('modal.chip')}
          </div>
        </div>
      </div>
    </div>
  );
}
