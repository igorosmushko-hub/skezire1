import Image from 'next/image';
import type { AiFeature } from '@/data/ai-features';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface Props {
  feature: AiFeature;
  locale: string;
}

export function AiLandingFeatures({ feature, locale }: Props) {
  const isKk = locale === 'kk';

  return (
    <section className="ai-features-section">
      {feature.features.map((f, i) => {
        const text = isKk ? f.kk : f.ru;
        const isReverse = i % 2 === 1;

        return (
          <div
            key={i}
            className={`ai-feature-row ${isReverse ? 'ai-feature-row--reverse' : ''}`}
          >
            <div className="ai-feature-text">
              <h2>{text.h2}</h2>
              <p>{text.desc}</p>
            </div>
            {f.afterImage ? (
              <BeforeAfterSlider
                before={f.image}
                after={f.afterImage}
                alt={text.h2}
                locale={locale}
              />
            ) : (
              <div className="ai-feature-image">
                <Image src={f.image} alt={text.h2} width={540} height={540} sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
