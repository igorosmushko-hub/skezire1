'use client';

import { useEffect, useRef } from 'react';

interface Props {
  totalUsers: number;
  locale: string;
}

export function LeaderboardHero({ totalUsers, locale }: Props) {
  const isKk = locale === 'kk';
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || totalUsers === 0) return;
    const duration = 1500;
    const start = performance.now();
    const from = Math.max(0, totalUsers - 100);

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (totalUsers - from) * eased);
      if (ref.current) ref.current.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [totalUsers]);

  return (
    <div className="lb-hero">
      <p className="lb-hero-label">
        {isKk ? 'Рулар жарысына' : 'К гонке родов'}
      </p>
      <div className="lb-hero-count">
        <span ref={ref}>{totalUsers.toLocaleString()}</span>
      </div>
      <p className="lb-hero-sub">
        {isKk ? 'қазақ қосылды!' : 'казахов присоединились!'}
      </p>
    </div>
  );
}
