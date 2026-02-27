import { TribeCardEnc } from './TribeCardEnc';
import type { Zhuz } from '@/lib/types';

interface ZhuzSectionProps {
  zhuz: Zhuz;
  locale: string;
  tribesHeading: string;
  moreLabel: string;
}

export function ZhuzSection({ zhuz, locale, tribesHeading, moreLabel }: ZhuzSectionProps) {
  const isKk = locale === 'kk';
  const name = isKk ? zhuz.kk : zhuz.ru;

  return (
    <section className="enc-main">
      <div className="container">
        <h2 className="enc-section-title">
          {tribesHeading} — {name}
        </h2>

        <div className="enc-tribes-grid">
          {zhuz.tribes.map((tribe) => (
            <TribeCardEnc key={tribe.id} tribe={tribe} locale={locale} zhuzId={zhuz.id} moreLabel={moreLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
