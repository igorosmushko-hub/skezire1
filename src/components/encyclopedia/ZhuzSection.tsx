import { useTranslations } from 'next-intl';
import { TribeCardEnc } from './TribeCardEnc';
import type { Zhuz } from '@/lib/types';

interface ZhuzSectionProps {
  zhuz: Zhuz;
  locale: string;
}

export function ZhuzSection({ zhuz, locale }: ZhuzSectionProps) {
  const t = useTranslations('enc');
  const isKk = locale === 'kk';
  const name = isKk ? zhuz.kk : zhuz.ru;

  return (
    <section className="enc-main">
      <div className="container">
        <h2 className="enc-section-title">
          {t('tribesHeading')} — {name}
        </h2>

        <div className="enc-tribes-grid">
          {zhuz.tribes.map((tribe) => (
            <TribeCardEnc key={tribe.id} tribe={tribe} locale={locale} zhuzId={zhuz.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
