'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { heroCreateTree, heroAiFeatures } from '@/lib/analytics';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section id="hero" className="hero">
      <div className="hero-ornament" aria-hidden="true">
        <Image src="/ornament-hero.webp" alt="" fill sizes="100vw" quality={5} preload fetchPriority="high" style={{ objectFit: 'cover' }} />
      </div>
      <div className="hero-content">
        <div className="hero-badge">{t('badge')}</div>
        <h1 className="hero-title">
          <span className="title-kaz">Шежіре</span>
          <span className="title-sub">{t('sub')}</span>
        </h1>
        <p className="hero-desc">{t('desc')}</p>
        <div className="hero-btns">
          <a href="#form-section" className="btn btn-primary" onClick={heroCreateTree}>{t('btn.create')}</a>
          <a href="#ai-section" className="btn btn-ai-hero" onClick={heroAiFeatures}>{t('btn.ai')}</a>
        </div>
      </div>

      <div className="hero-scroll-hint"><span>↓</span></div>
    </section>
  );
}
