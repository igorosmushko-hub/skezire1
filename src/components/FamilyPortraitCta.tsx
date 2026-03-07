'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export function FamilyPortraitCta() {
  const locale = useLocale();
  const t = useTranslations('ai');
  const isKk = locale === 'kk';

  return (
    <section className="fp-cta">
      <div className="container">
        <div className="fp-cta-inner">
          <div className="fp-cta-text">
            <span className="fp-cta-badge">AI</span>
            <h2>{t('fp.h3')}</h2>
            <p>{t('fp.p')}</p>
          </div>
          <div className="fp-cta-preview">
            <img src="/ai-backgrounds/yurt.jpg" alt="" className="fp-cta-img fp-cta-img--1" loading="lazy" />
            <img src="/ai-backgrounds/steppe.jpg" alt="" className="fp-cta-img fp-cta-img--2" loading="lazy" />
            <img src="/ai-backgrounds/newyear.jpg" alt="" className="fp-cta-img fp-cta-img--3" loading="lazy" />
          </div>
          <Link
            href={`/${locale}/ai/family-portrait/create`}
            className="btn btn-ai fp-cta-btn"
          >
            {isKk ? 'Отбасылық портрет жасау' : 'Создать семейный портрет'}
          </Link>
        </div>
      </div>
    </section>
  );
}
