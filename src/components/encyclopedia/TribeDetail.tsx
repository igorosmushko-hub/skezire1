import { useTranslations } from 'next-intl';
import type { Tribe } from '@/lib/types';

interface TribeDetailProps {
  tribe: Tribe;
  locale: string;
}

export function TribeDetail({ tribe, locale }: TribeDetailProps) {
  const t = useTranslations('enc');
  const isKk = locale === 'kk';

  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const subgroup = isKk ? tribe.subgroup_kk : tribe.subgroup_ru;

  return (
    <article className="tribe-detail">
      <div className="tribe-detail-desc">{desc}</div>

      <div className="tribe-detail-grid">
        {tribe.tamga && (
          <div className="tribe-detail-card">
            <div className="tribe-detail-card-label">{t('tribeTamga')}</div>
            <div className="tribe-detail-card-value tamga-big">{tribe.tamga}</div>
          </div>
        )}
        {tribe.uran && (
          <div className="tribe-detail-card">
            <div className="tribe-detail-card-label">{t('tribeUran')}</div>
            <div className="tribe-detail-card-value">{tribe.uran}</div>
          </div>
        )}
        {region && (
          <div className="tribe-detail-card">
            <div className="tribe-detail-card-label">{t('tribeRegion')}</div>
            <div className="tribe-detail-card-value" style={{ fontSize: '1rem' }}>{region}</div>
          </div>
        )}
        {subgroup && (
          <div className="tribe-detail-card">
            <div className="tribe-detail-card-label">{t('tribeSubgroup')}</div>
            <div className="tribe-detail-card-value" style={{ fontSize: '1.1rem' }}>{subgroup}</div>
          </div>
        )}
      </div>

      {tribe.notable.length > 0 && (
        <div className="tribe-notable">
          <h3 className="tribe-notable-title">{t('tribeNotable')}</h3>
          <div className="notable-list">
            {tribe.notable.map((p) => (
              <div key={p.name} className="notable-item">
                <div className="notable-item-name">{p.name}</div>
                <div className="notable-item-role">{isKk ? p.role_kk : p.role_ru}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
