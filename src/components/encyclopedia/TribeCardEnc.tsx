import { useTranslations } from 'next-intl';
import type { Tribe } from '@/lib/types';

interface TribeCardEncProps {
  tribe: Tribe;
  locale: string;
}

export function TribeCardEnc({ tribe, locale }: TribeCardEncProps) {
  const t = useTranslations('enc');
  const isKk = locale === 'kk';

  const name = isKk ? tribe.kk : tribe.ru;
  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const notable = tribe.notable;

  return (
    <div className="tribe-card tc-visible" style={{ display: 'block' }}>
      <div className="tc-header">
        <div className="tc-tamga">{tribe.tamga}</div>
        <div>
          <div className="tc-name">{name}</div>
          <div className="tc-uran">{tribe.uran}</div>
        </div>
      </div>
      <p className="tc-desc">{desc}</p>
      <div className="tc-meta">
        <div className="tc-row">
          <span className="tc-label">{t('region')}:</span>
          <span className="tc-val">{region}</span>
        </div>
        <div className="tc-row">
          <span className="tc-label">{t('uran')}:</span>
          <span className="tc-val tc-uran-val">{tribe.uran}</span>
        </div>
      </div>
      {notable.length > 0 && (
        <>
          <div className="tc-notable-title">{t('notable')}</div>
          <ul className="tc-notable-list">
            {notable.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong> — {isKk ? p.role_kk : p.role_ru}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
