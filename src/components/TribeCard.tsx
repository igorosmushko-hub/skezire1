'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Tribe } from '@/lib/types';

interface TribeCardProps {
  tribe: Tribe | null;
  locale: string;
}

export function TribeCard({ tribe, locale }: TribeCardProps) {
  const t = useTranslations('tribe');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !tribe) return;
    el.classList.remove('tc-visible');
    requestAnimationFrame(() => {
      el.classList.add('tc-visible');
    });
  }, [tribe]);

  if (!tribe) return <div ref={cardRef} className="tribe-card" style={{ display: 'none' }} aria-live="polite" />;

  const isKk = locale === 'kk';
  const name = isKk ? tribe.kk : tribe.ru;
  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const subgroup = isKk ? tribe.subgroup_kk : tribe.subgroup_ru;
  const notable = tribe.notable;

  return (
    <div ref={cardRef} className="tribe-card" style={{ display: 'block' }} aria-live="polite">
      <div className="tc-header">
        <div className="tc-tamga">{tribe.tamga}</div>
        <div>
          <div className="tc-name">{name}</div>
          <div className="tc-uran">{tribe.uran}</div>
        </div>
      </div>
      <p className="tc-desc">{desc}</p>
      <div className="tc-meta">
        <div className="tc-row">
          <span className="tc-label">{t('region')}:</span>
          <span className="tc-val">{region}</span>
        </div>
        <div className="tc-row">
          <span className="tc-label">{t('uran')}:</span>
          <span className="tc-val tc-uran-val">{tribe.uran}</span>
        </div>
        {subgroup && (
          <div className="tc-row">
            <span className="tc-label">{t('subgroup')}:</span>
            <span className="tc-val">{subgroup}</span>
          </div>
        )}
      </div>
      {notable.length > 0 && (
        <>
          <div className="tc-notable-title">{t('notable')}</div>
          <ul className="tc-notable-list">
            {notable.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong> — {isKk ? p.role_kk : p.role_ru}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
