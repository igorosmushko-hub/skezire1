import { useTranslations } from 'next-intl';
import type { Tribe } from '@/lib/types';

interface TribeDetailProps {
  tribe: Tribe;
  locale: string;
}

export function TribeDetail({ tribe, locale }: TribeDetailProps) {
  const t = useTranslations('enc');
  const isKk = locale === 'kk';

  const name = isKk ? tribe.kk : tribe.ru;
  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const subgroup = isKk ? tribe.subgroup_kk : tribe.subgroup_ru;

  return (
    <article className="tribe-detail">
      <div className="tribe-detail-header">
        <div className="tribe-detail-tamga">{tribe.tamga}</div>
        <div>
          <h1 className="tribe-detail-name">{name}</h1>
          <div className="tribe-detail-uran">{tribe.uran}</div>
        </div>
      </div>

      <p className="tribe-detail-desc">{desc}</p>

      <div className="tribe-detail-meta">
        <div className="tribe-detail-meta-item">
          <span className="tribe-detail-meta-label">{t('tribeTamga')}</span>
          <span className="tribe-detail-meta-value tribe-detail-tamga-val">{tribe.tamga}</span>
        </div>
        <div className="tribe-detail-meta-item">
          <span className="tribe-detail-meta-label">{t('tribeUran')}</span>
          <span className="tribe-detail-meta-value">{tribe.uran}</span>
        </div>
        <div className="tribe-detail-meta-item">
          <span className="tribe-detail-meta-label">{t('tribeRegion')}</span>
          <span className="tribe-detail-meta-value">{region}</span>
        </div>
        {subgroup && (
          <div className="tribe-detail-meta-item">
            <span className="tribe-detail-meta-label">{t('tribeSubgroup')}</span>
            <span className="tribe-detail-meta-value">{subgroup}</span>
          </div>
        )}
      </div>

      {tribe.notable.length > 0 && (
        <div className="tribe-notable">
          <h2 className="tribe-notable-title">{t('tribeNotable')}</h2>
          <ul className="tribe-notable-list">
            {tribe.notable.map((p) => (
              <li key={p.name} className="tribe-notable-item">
                <strong>{p.name}</strong>
                <span>{isKk ? p.role_kk : p.role_ru}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
