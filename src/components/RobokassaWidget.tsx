'use client';

import { useEffect } from 'react';
import '@/styles/robokassa-widget.css';

interface Props {
  /** Direct Robokassa payment URL for the iframe */
  fallbackUrl: string;
  params?: Record<string, unknown>;
  onClose: () => void;
}

/**
 * Robokassa payment widget — shows our own overlay with an iframe.
 * The close button is fully under our control.
 */
export function RobokassaWidget({ fallbackUrl, onClose }: Props) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Listen for postMessage from success/fail pages loaded inside the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'robokassa-payment') {
        onClose();
        if (e.data.status === 'success') {
          window.location.reload();
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onClose]);

  return (
    <div className="robokassa-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="robokassa-widget">
        <button className="robokassa-close" onClick={onClose} aria-label="Прервать оплату">
          &#10005;
        </button>
        <iframe
          className="robokassa-iframe"
          src={fallbackUrl}
          title="Robokassa payment"
          allow="payment"
        />
      </div>
    </div>
  );
}
