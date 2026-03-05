'use client';

import { useState } from 'react';

interface Props {
  before: string;
  after: string;
  alt: string;
  locale: string;
}

export function BeforeAfterSlider({ before, after, alt, locale }: Props) {
  const [pos, setPos] = useState(50);
  const isKk = locale === 'kk';

  return (
    <div className="ba-slider">
      {/* After (bottom layer) */}
      <img className="ba-slider-after" src={after} alt={`${alt} — ${isKk ? 'кейін' : 'после'}`} loading="lazy" />

      {/* Before (top layer, clipped) */}
      <div className="ba-slider-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={`${alt} — ${isKk ? 'бұрын' : 'до'}`} loading="lazy" />
      </div>

      {/* Divider line + handle */}
      <div className="ba-slider-line" style={{ left: `${pos}%` }}>
        <div className="ba-slider-handle" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 3L1 8l4 5M11 3l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="ba-slider-label ba-slider-label--before">{isKk ? 'Бұрын' : 'До'}</span>
      <span className="ba-slider-label ba-slider-label--after">{isKk ? 'Кейін' : 'После'}</span>

      {/* Invisible range input for mouse + touch interaction */}
      <input
        className="ba-slider-range"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={isKk ? 'Бұрын/кейін салыстыру' : 'Сравнение до/после'}
      />
    </div>
  );
}
