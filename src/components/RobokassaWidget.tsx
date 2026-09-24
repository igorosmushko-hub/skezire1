'use client';

import { useEffect, useRef } from 'react';
import '@/styles/robokassa-widget.css';

interface Props {
  params: Record<string, unknown>;
  /** Fallback URL if the official SDK script fails to load */
  fallbackUrl: string;
  onClose: () => void;
}

declare global {
  interface Window {
    Robokassa?: {
      StartPayment: (params: Record<string, unknown>) => void;
    };
  }
}

/**
 * Robokassa payment widget using their official iframe SDK — the raw iframe
 * fallback loses payment session state in browsers that block third-party
 * cookies (mobile Safari and others), causing Robokassa to show a generic
 * "server unavailable" error after card entry.
 *
 * The SDK's own onClose callback isn't reliably fired, so we render our own
 * close button layered on top as the guaranteed way out.
 */
export function RobokassaWidget({ params, fallbackUrl, onClose }: Props) {
  const initiated = useRef(false);

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

  useEffect(() => {
    if (initiated.current) return;
    initiated.current = true;

    const paymentParams: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) paymentParams[key] = value;
    }

    paymentParams.onSuccess = () => {
      onClose();
      window.location.reload();
    };
    paymentParams.onFail = () => {
      onClose();
    };
    paymentParams.onClose = () => {
      onClose();
    };

    const start = () => {
      if (window.Robokassa) {
        window.Robokassa.StartPayment(paymentParams);
      } else {
        window.location.href = fallbackUrl;
      }
    };

    if (window.Robokassa) {
      start();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://auth.robokassa.kz/Merchant/bundle/robokassa_iframe.js';
    script.async = true;
    script.onload = start;
    script.onerror = () => { window.location.href = fallbackUrl; };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [params, fallbackUrl, onClose]);

  return (
    <button
      className="robokassa-close robokassa-close-standalone"
      onClick={onClose}
      aria-label="Прервать оплату"
    >
      &#10005;
    </button>
  );
}
