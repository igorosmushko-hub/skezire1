'use client';

import { useEffect, useRef } from 'react';

interface RobokassaParams {
  MerchantLogin: string;
  OutSum: string;
  InvId: number;
  Description: string;
  SignatureValue: string;
  Culture: string;
  Encoding: string;
  IsTest?: number;
  Email?: string;
  [key: string]: string | number | undefined;
}

interface Props {
  params: RobokassaParams;
  /** Fallback URL if iframe SDK fails to load */
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
 * Robokassa payment widget using their official iframe SDK.
 * Opens a modal payment form via Robokassa.StartPayment().
 * Falls back to redirect if SDK fails to load.
 */
export function RobokassaWidget({ params, fallbackUrl, onClose }: Props) {
  const initiated = useRef(false);

  // Listen for postMessage from success/fail pages loaded inside iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'robokassa-payment') {
        onClose();
        // If payment succeeded, reload to update user balance
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

    // Build clean params object (remove undefined values)
    const paymentParams: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        paymentParams[key] = value;
      }
    }

    // If SDK already loaded, start payment immediately
    if (window.Robokassa) {
      window.Robokassa.StartPayment(paymentParams);
      return;
    }

    // Load the official Robokassa iframe SDK
    const script = document.createElement('script');
    script.src = 'https://auth.robokassa.kz/Merchant/bundle/robokassa_iframe.js';
    script.async = true;

    script.onload = () => {
      if (window.Robokassa) {
        window.Robokassa.StartPayment(paymentParams);
      } else {
        // SDK loaded but Robokassa object not available — fallback
        window.location.href = fallbackUrl;
      }
    };

    script.onerror = () => {
      // Script failed to load — fallback to redirect
      window.location.href = fallbackUrl;
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts before load
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [params, fallbackUrl, onClose]);

  // The SDK renders its own modal overlay — no visual render needed
  return null;
}
