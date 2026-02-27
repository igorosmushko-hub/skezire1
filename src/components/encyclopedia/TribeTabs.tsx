'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Tribe } from '@/lib/types';

interface TribeTabsLabels {
  tamga: string;
  uran: string;
  region: string;
  subgroup: string;
  notable: string;
  moreLink: string;
}

interface TribeTabsProps {
  tribes: Tribe[];
  locale: string;
  zhuzId: string;
  labels: TribeTabsLabels;
}

export function TribeTabs({ tribes, locale, zhuzId, labels }: TribeTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isKk = locale === 'kk';
  const tribe = tribes[activeIndex];

  const name = isKk ? tribe.kk : tribe.ru;
  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const subgroup = isKk ? tribe.subgroup_kk : tribe.subgroup_ru;

  return (
    <div className="tribe-tabs">
      {/* Tab bar */}
      <div className="tribe-tabs-bar">
        {tribes.map((t, i) => (
          <button
            key={t.id}
            className={`tribe-tab${i === activeIndex ? ' tribe-tab--active' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            <span className="tribe-tab-tamga">{t.tamga}</span>
            <span className="tribe-tab-name">{isKk ? t.kk : t.ru}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tribe-tabs-content">
        <div className="tribe-tabs-header">
          <div className="tribe-tabs-tamga-big">{tribe.tamga}</div>
          <div>
            <h3 className="tribe-tabs-title">{name}</h3>
            {subgroup && <span className="tribe-tabs-subgroup">{subgroup}</span>}
          </div>
        </div>

        <p className="tribe-tabs-desc">{desc}</p>

        <div className="tribe-tabs-grid">
          {tribe.uran && (
            <div className="tribe-tabs-card">
              <div className="tribe-tabs-card-label">{labels.uran}</div>
              <div className="tribe-tabs-card-value">{tribe.uran}</div>
            </div>
          )}
          {region && (
            <div className="tribe-tabs-card">
              <div className="tribe-tabs-card-label">{labels.region}</div>
              <div className="tribe-tabs-card-value tribe-tabs-card-value--sm">{region}</div>
            </div>
          )}
          {subgroup && (
            <div className="tribe-tabs-card">
              <div className="tribe-tabs-card-label">{labels.subgroup}</div>
              <div className="tribe-tabs-card-value tribe-tabs-card-value--sm">{subgroup}</div>
            </div>
          )}
        </div>

        {tribe.notable.length > 0 && (
          <div className="tribe-tabs-notable">
            <h4 className="tribe-tabs-notable-title">{labels.notable}</h4>
            <div className="tribe-tabs-notable-list">
              {tribe.notable.map((p) => (
                <div key={p.name} className="tribe-tabs-notable-item">
                  <div className="tribe-tabs-notable-name">{p.name}</div>
                  <div className="tribe-tabs-notable-role">{isKk ? p.role_kk : p.role_ru}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/${locale}/encyclopedia/${zhuzId}/${tribe.id}`}
          className="tribe-tabs-link"
        >
          {labels.moreLink}
        </Link>
      </div>
    </div>
  );
}
