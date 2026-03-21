'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { fpCtaClick } from '@/lib/analytics';

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
            <Image src="/ai-backgrounds/yurt.jpg" alt={isKk ? 'Юрта — AI фон' : 'Юрта — AI фон'} width={300} height={200} className="fp-cta-img fp-cta-img--1" loading="lazy" />
            <Image src="/ai-backgrounds/steppe.jpg" alt={isKk ? 'Дала — AI фон' : 'Степь — AI фон'} width={300} height={200} className="fp-cta-img fp-cta-img--2" loading="lazy" />
            <Image src="/ai-backgrounds/newyear.jpg" alt={isKk ? 'Жаңа жыл — AI фон' : 'Новый год — AI фон'} width={300} height={200} className="fp-cta-img fp-cta-img--3" loading="lazy" />
          </div>
          <Link
            href={`/${locale}/ai/family-portrait/create`}
            className="btn btn-ai fp-cta-btn"
            onClick={fpCtaClick}
          >
            {isKk ? 'Отбасылық портрет жасау' : 'Создать семейный портрет'}
          </Link>
        </div>
      </div>
    </section>
  );
}
