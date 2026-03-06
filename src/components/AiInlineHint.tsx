import Link from 'next/link';
import { AI_FEATURES } from '@/data/ai-features';
import '@/styles/ai-promo.css';

const HINTS: Record<string, { kk: string; ru: string }> = {
  past: {
    kk: 'AI нейросеті сізді 100 жыл бұрынғы түрде көрсете алады',
    ru: 'AI покажет, как бы вы выглядели 100 лет назад',
  },
  ancestor: {
    kk: 'Бабаңыз жас кезінде қандай болған? AI-мен көріңіз',
    ru: 'Как выглядел ваш предок в молодости? Узнайте с AI',
  },
  'action-figure': {
    kk: 'Өзіңізді экшн-фигуркаға айналдырыңыз',
    ru: 'Превратите себя в экшн-фигурку',
  },
  'pet-humanize': {
    kk: 'Питомецті адамға айналдырыңыз',
    ru: 'Превратите питомца в человека',
  },
  'ghibli-style': {
    kk: 'Гибли стиліндегі портрет жасаңыз',
    ru: 'Создайте портрет в стиле Гибли',
  },
};

interface Props {
  slug: string;
  locale: string;
}

export function AiInlineHint({ slug, locale }: Props) {
  const isKk = locale === 'kk';
  const feature = AI_FEATURES.find((f) => f.slug === slug);
  const hint = HINTS[slug];
  if (!feature || !hint) return null;

  return (
    <Link href={`/${locale}/ai/${slug}`} className="ai-inline-hint">
      <span className="ai-inline-hint-icon">{feature.icon}</span>
      <span className="ai-inline-hint-text">{isKk ? hint.kk : hint.ru}</span>
      <span className="ai-inline-hint-arrow">
        {isKk ? 'Қолданып көру →' : 'Попробовать →'}
      </span>
    </Link>
  );
}
