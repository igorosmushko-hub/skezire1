'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

interface PdfModalProps {
  open: boolean;
  onClose: () => void;
}

export function PdfModal({ open, onClose }: PdfModalProps) {
  const t = useTranslations('tree');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (!open) return null;

  return (
    <div
      className="modal open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-card pdf-modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">&#10005;</button>
        <div className="modal-icon">&#128196;</div>
        <h2 className="modal-title">{t('pdf.modalTitle')}</h2>
        <p className="modal-text">{t('pdf.modalDesc')}</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="pdf-modal-form">
            <label className="pdf-modal-label">{t('pdf.emailLabel')}</label>
            <input
              type="email"
              className="pdf-modal-input"
              placeholder={t('pdf.emailPh')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary pdf-modal-submit">
              {t('pdf.submit')}
            </button>
          </form>
        ) : (
          <div className="modal-chip" style={{ marginTop: '16px' }}>
            &#10003; {t('pdf.thanks')}
          </div>
        )}

        <button className="ai-past-back" onClick={onClose}>
          {t('pdf.close')}
        </button>
      </div>
    </div>
  );
}
