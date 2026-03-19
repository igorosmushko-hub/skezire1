'use client';

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import '@/styles/robokassa-widget.css';

interface Props {
  url: string;
  onClose: () => void;
}

/**
 * Robokassa payment widget — opens the payment page in an iframe modal
 * so the user stays on the site during checkout.
 */
export function RobokassaWidget({ url, onClose }: Props) {
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const modal = (
    <div
      className="robokassa-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdrop}
    >
      <div className="robokassa-widget">
        <button className="robokassa-close" onClick={onClose} aria-label="Close">
          &#10005;
        </button>
        <iframe
          src={url}
          className="robokassa-iframe"
          title="Robokassa Payment"
          allow="payment"
        />
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
