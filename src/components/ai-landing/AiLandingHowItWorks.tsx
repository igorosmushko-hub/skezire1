import type { AiFeature } from '@/data/ai-features';

interface Props {
  feature: AiFeature;
  locale: string;
}

export function AiLandingHowItWorks({ feature, locale }: Props) {
  const isKk = locale === 'kk';
  const hiw = isKk ? feature.howItWorks.kk : feature.howItWorks.ru;

  return (
    <section className="ai-hiw-section">
      <h2 className="ai-hiw-title">{hiw.title}</h2>
      <div className="ai-hiw-grid">
        {hiw.steps.map((step, i) => (
          <div key={i} className="ai-hiw-step">
            <div className="ai-hiw-num">{i + 1}</div>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
