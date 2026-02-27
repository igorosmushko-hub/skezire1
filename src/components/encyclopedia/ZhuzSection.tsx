import { TribeCardEnc } from './TribeCardEnc';
import { TribeTabs } from './TribeTabs';
import type { Zhuz } from '@/lib/types';

interface TribeTabsLabels {
  tamga: string;
  uran: string;
  region: string;
  subgroup: string;
  notable: string;
  moreLink: string;
}

interface ZhuzSectionProps {
  zhuz: Zhuz;
  locale: string;
  tribesHeading: string;
  moreLabel: string;
  tribeTabsLabels: TribeTabsLabels;
}

export function ZhuzSection({ zhuz, locale, tribesHeading, moreLabel, tribeTabsLabels }: ZhuzSectionProps) {
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

        <TribeTabs
          tribes={zhuz.tribes}
          locale={locale}
          zhuzId={zhuz.id}
          labels={tribeTabsLabels}
        />
      </div>
    </section>
  );
}
