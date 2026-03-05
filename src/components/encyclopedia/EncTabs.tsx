'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Zhuz } from '@/lib/types';

interface EncTabsProps {
  zhuzes: Zhuz[];
  locale: string;
  moreLabel: string;
}

export function EncTabs({ zhuzes, locale, moreLabel }: EncTabsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const isKk = locale === 'kk';
  const active = zhuzes[activeIdx];

  return (
    <>
      {/* Tab bar */}
      <div className="enc-tabs-bar">
        <div className="container enc-tabs-inner">
          {zhuzes.map((z, i) => (
            <button
              key={z.id}
              className={`enc-tab${i === activeIdx ? ' enc-tab--active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              {isKk ? z.kk : z.ru}
            </button>
          ))}
        </div>
      </div>

      {/* Active zhuz content */}
      <main className="enc-main">
        <div className="container">
          {/* Zhuz description */}
          <div className="enc-zhuz-desc-row">
            <p className="enc-zhuz-desc">{isKk ? active.desc_kk : active.desc_ru}</p>
          </div>

          {/* Tribe cards grid */}
          <div className="enc-tribe-grid">
            {active.tribes.map((tribe) => {
              const name = isKk ? tribe.kk : tribe.ru;
              const altName = isKk ? tribe.ru : tribe.kk;
              const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
              const region = isKk ? tribe.region_kk : tribe.region_ru;

              return (
                <Link
                  key={tribe.id}
                  href={`/${locale}/encyclopedia/${active.id}/${tribe.id}`}
                  className="enc-tribe-card"
                >
                  <div className="enc-tribe-card-header">
                    <div className="enc-tribe-card-tamga">{tribe.tamga}</div>
                    <div>
                      <div className="enc-tribe-card-name">{name}</div>
                      {altName && <div className="enc-tribe-card-subname">{altName}</div>}
                    </div>
                  </div>
                  <div className="enc-tribe-card-desc">{desc}</div>
                  <div className="enc-tribe-card-meta">
                    {region && <span>📍 {region}</span>}
                    {tribe.uran && <span>📣 {tribe.uran}</span>}
                  </div>
                  <div className="enc-tribe-card-link">{moreLabel}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
