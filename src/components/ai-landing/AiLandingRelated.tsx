'use client';

import Link from 'next/link';
import type { AiFeature } from '@/data/ai-features';
import { aiLandingRelated } from '@/lib/analytics';

interface Props {
  features: AiFeature[];
  locale: string;
}

export function AiLandingRelated({ features, locale }: Props) {
  const isKk = locale === 'kk';

  return (
    <section className="ai-related-section">
      <h2 className="ai-related-title">
        {isKk ? 'Басқа AI мүмкіндіктер' : 'Другие AI функции'}
      </h2>
      <div className="ai-related-grid">
        {features.map((f) => {
          const hero = isKk ? f.hero.kk : f.hero.ru;
          const seo = isKk ? f.seo.kk : f.seo.ru;
          return (
            <Link
              key={f.slug}
              href={`/${locale}/ai/${f.slug}`}
              className="ai-related-card"
              onClick={() => aiLandingRelated(f.slug)}
            >
              <div className="ai-related-card-icon">{f.icon}</div>
              <h3>{hero.h1}</h3>
              <p>{seo.description.slice(0, 80)}...</p>
            </Link>
          );
        })}
      </div>
      <div className="ai-related-all">
        <Link href={`/${locale}/ai`} className="ai-related-all-link">
          {isKk ? 'Барлық AI мүмкіндіктерді көру' : 'Смотреть все AI функции'} &rarr;
        </Link>
      </div>
    </section>
  );
}
