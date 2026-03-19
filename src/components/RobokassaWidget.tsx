'use client';

import { useEffect } from 'react';

interface Props {
  url: string;
  onClose: () => void;
}

/**
 * Opens Robokassa payment in a popup window.
 * Robokassa blocks iframe embedding (error 30), so popup is the reliable approach.
 * When the popup is closed, onClose fires to reset the UI state.
 */
export function RobokassaWidget({ url, onClose }: Props) {
  useEffect(() => {
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'robokassa_payment',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );

    // If popup was blocked by browser, fall back to redirect
    if (!popup || popup.closed) {
      window.location.href = url;
      return;
    }

    // Poll to detect when popup is closed
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        onClose();
      }
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, [url, onClose]);

  // No visual render — payment happens in the popup window
  return null;
}
