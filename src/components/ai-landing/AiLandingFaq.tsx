import type { AiFeature } from '@/data/ai-features';

interface Props {
  feature: AiFeature;
  locale: string;
}

export function AiLandingFaq({ feature, locale }: Props) {
  const isKk = locale === 'kk';

  return (
    <section className="ai-faq-section">
      <h2 className="ai-faq-title">
        {isKk ? 'Жиі қойылатын сұрақтар' : 'Часто задаваемые вопросы'}
      </h2>
      {feature.faq.map((item, i) => {
        const faq = isKk ? item.kk : item.ru;
        return (
          <details key={i} className="ai-faq-item">
            <summary>{faq.q}</summary>
            <div className="ai-faq-answer">{faq.a}</div>
          </details>
        );
      })}
    </section>
  );
}
