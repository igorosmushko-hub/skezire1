'use client';

import { useEffect } from 'react';

/**
 * Activates scroll-reveal animations via IntersectionObserver.
 * Elements with class "reveal" get "visible" added when they enter the viewport.
 */
export function useReveal(rootMargin = '0px 0px -60px 0px') {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal:not(.visible)');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold: 0.1 },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [rootMargin]);
}
