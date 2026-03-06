import Link from 'next/link';
import { AI_FEATURES } from '@/data/ai-features';
import '@/styles/ai-promo.css';

const TITLES = {
  default: { kk: 'AI-мен суретіңізді түрлендіріңіз', ru: 'Преобразите своё фото с помощью AI' },
  history: { kk: 'Тарихты AI-мен жандандырыңыз', ru: 'Оживите историю с помощью AI' },
  blog: { kk: 'AI-ды қолданып көріңіз', ru: 'Попробуйте наш AI' },
};

interface Props {
  locale: string;
  features?: string[];
  variant?: 'default' | 'history' | 'blog';
}

export function AiPromoBanner({
  locale,
  features = ['past', 'ancestor', 'action-figure'],
  variant = 'default',
}: Props) {
  const isKk = locale === 'kk';
  const title = TITLES[variant];
  const items = features
    .map((slug) => AI_FEATURES.find((f) => f.slug === slug))
    .filter(Boolean);

  return (
    <section className="ai-promo-banner">
      <h3 className="ai-promo-banner-title">{isKk ? title.kk : title.ru}</h3>
      <p className="ai-promo-banner-sub">
        {isKk
          ? 'Суретіңізді жүктеңіз — нәтиже 10 секундта'
          : 'Загрузите фото — результат за 10 секунд'}
      </p>

      <div className="ai-promo-banner-grid">
        {items.map((f) => {
          if (!f) return null;
          const hero = isKk ? f.hero.kk : f.hero.ru;
          const seo = isKk ? f.seo.kk : f.seo.ru;
          return (
            <Link
              key={f.slug}
              href={`/${locale}/ai/${f.slug}`}
              className="ai-promo-banner-card"
            >
              <span className="ai-promo-banner-card-icon">{f.icon}</span>
              <span className="ai-promo-banner-card-name">{hero.h1}</span>
              <span className="ai-promo-banner-card-desc">
                {seo.description.slice(0, 70)}...
              </span>
              <span className="ai-promo-banner-card-btn">
                {isKk ? 'Қолданып көру' : 'Попробовать'}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="ai-promo-banner-footer">
        <Link href={`/${locale}/ai`} className="ai-promo-banner-all">
          {isKk ? 'Барлық AI мүмкіндіктер →' : 'Все AI функции →'}
        </Link>
        <a href={`/${locale}#form-section`} className="ai-promo-banner-secondary">
          {isKk ? 'Шежіре жасау' : 'Создать шежіре'}
        </a>
      </div>
    </section>
  );
}
