'use client';

import { useTranslations, useLocale } from 'next-intl';
import { BeforeAfterSlider } from './ai-landing/BeforeAfterSlider';
import Link from 'next/link';

const DEMOS = [
  { before: '/ai-examples/before-woman.webp', after: '/ai-examples/past-1.webp', slug: 'past', keyH3: 'past.h3' },
  { before: '/ai-examples/before-elderly-woman.webp', after: '/ai-examples/ancestor-rejuvenated.webp', slug: 'ancestor', keyH3: 'gm.h3' },
  { before: '/ai-examples/before-cat.webp', after: '/ai-examples/pet-humanize-1.webp', slug: 'pet-humanize', keyH3: 'pet.h3' },
];

export function AiShowcase() {
  const t = useTranslations('ai');
  const th = useTranslations('aiShowcase');
  const locale = useLocale();

  return (
    <section className="ai-showcase">
      <div className="container">
        <h2 className="ai-showcase-title">{th('title')}</h2>

        <div className="ai-showcase-grid">
          {DEMOS.map((d) => (
            <Link key={d.slug} href={`/${locale}/ai/${d.slug}`} className="ai-showcase-card">
              <BeforeAfterSlider
                before={d.before}
                after={d.after}
                alt={t(d.keyH3)}
                locale={locale}
              />
              <span className="ai-showcase-label">{t(d.keyH3)}</span>
            </Link>
          ))}
        </div>

        <div className="ai-showcase-cta">
          <a href="#ai-section" className="btn btn-primary">{th('cta')}</a>
          <p className="ai-showcase-micro">{th('micro')}</p>
        </div>
      </div>
    </section>
  );
}
