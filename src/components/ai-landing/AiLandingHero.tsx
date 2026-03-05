import { Breadcrumb } from '@/components/encyclopedia/Breadcrumb';
import { HeroCtaButton } from './HeroCtaButton';
import type { AiFeature } from '@/data/ai-features';

interface Props {
  feature: AiFeature;
  locale: string;
}

export function AiLandingHero({ feature, locale }: Props) {
  const isKk = locale === 'kk';
  const hero = isKk ? feature.hero.kk : feature.hero.ru;

  return (
    <section className="ai-landing-hero">
      <div className="ai-landing-hero-content">
        <Breadcrumb
          items={[
            { label: 'Шежіре', href: `/${locale}` },
            { label: isKk ? 'AI' : 'AI', href: `/${locale}/ai` },
            { label: hero.h1 },
          ]}
        />
        <span className="ai-landing-hero-icon">{feature.icon}</span>
        <h1>{hero.h1}</h1>
        <p className="ai-landing-hero-sub">{hero.subtitle}</p>
        <HeroCtaButton featureSlug={feature.slug} label={hero.cta} />
      </div>
    </section>
  );
}
