'use client';

import { useEffect } from 'react';

/**
 * When payment success/fail pages load inside Robokassa iframe,
 * notify the parent window so it can close the widget.
 */
export function PaymentIframeNotifier({ status }: { status: 'success' | 'fail' }) {
  useEffect(() => {
    // Detect if we're inside an iframe
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'robokassa-payment', status }, '*');
    }
  }, [status]);

  return null;
}
