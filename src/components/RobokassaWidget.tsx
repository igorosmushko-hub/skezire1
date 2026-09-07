'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '@/styles/robokassa-widget.css';

interface Props {
  params: Record<string, unknown>;
  fallbackUrl: string;
  onClose: () => void;
}

declare global {
  interface Window {
    Robokassa?: {
      StartPayment: (params: Record<string, unknown>) => void;
      ClosePaymentForm: () => void;
    };
  }
}

// The SDK declares globals and registers a listener, so load it once per page.
let sdkLoad: Promise<void> | undefined;

export function RobokassaWidget({ params, fallbackUrl, onClose }: Props) {
  const closeRef = useRef(onClose);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    let active = true;
    let frame: HTMLIFrameElement | null = null;
    const handler = (event: MessageEvent) => {
      if (!frame) return;
      if (event.origin === 'https://auth.robokassa.kz' && event.data?.action === 'closeRobokassaFrame') {
        queueMicrotask(() => { if (active) closeRef.current(); });
      } else if (event.origin === window.location.origin && event.source === frame.contentWindow
        && event.data?.type === 'robokassa-payment'
        && (event.data.status === 'success' || event.data.status === 'fail')) {
        closeRef.current();
        if (event.data.status === 'success') window.location.reload();
      }
    };

    if (!window.Robokassa && !sdkLoad) {
      sdkLoad = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://auth.robokassa.kz/Merchant/bundle/robokassa_iframe.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          script.remove();
          sdkLoad = undefined;
          reject(new Error('payment_sdk_unavailable'));
        };
        document.body.appendChild(script);
      });
    }

    void (sdkLoad ?? Promise.resolve()).then(() => {
      if (!active) return;
      if (!window.Robokassa) throw new Error('payment_sdk_unavailable');
      window.addEventListener('message', handler);
      window.Robokassa.StartPayment(Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      ));
      frame = document.getElementById('robokassa_iframe') as HTMLIFrameElement | null;
      // The SDK submits this form synchronously and otherwise leaves it in the DOM.
      document.querySelector('form[target="robokassa_iframe"]')?.remove();
      // Both use the browser's maximum z-index; the portal must follow the iframe.
      if (frame && buttonRef.current) frame.after(buttonRef.current);
    }).catch(() => {
      if (active) window.location.href = fallbackUrl;
    });

    return () => {
      active = false;
      window.removeEventListener('message', handler);
      if (frame?.isConnected) {
        window.Robokassa?.ClosePaymentForm();
        frame.remove();
      }
    };
  }, [params, fallbackUrl]);

  return typeof document === 'undefined' ? null : createPortal(
    <button
      ref={buttonRef}
      type="button"
      className="robokassa-close robokassa-close-standalone"
      onClick={onClose}
      aria-label="Прервать оплату"
    >
      &#10005;
    </button>,
    document.body,
  );
}
