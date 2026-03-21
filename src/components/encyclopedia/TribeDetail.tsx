import type { Tribe } from '@/lib/types';
import { LinkedText } from '@/components/LinkedText';

interface TribeDetailTranslations {
  tamga: string;
  uran: string;
  region: string;
  subgroup: string;
  notable: string;
}

interface TribeDetailProps {
  tribe: Tribe;
  locale: string;
  zhuzName: string;
  zhuzId: string;
  labels: TribeDetailTranslations;
}

export function TribeDetail({ tribe, locale, zhuzName, zhuzId, labels }: TribeDetailProps) {
  const isKk = locale === 'kk';

  const desc = isKk ? tribe.desc_kk : tribe.desc_ru;
  const region = isKk ? tribe.region_kk : tribe.region_ru;
  const history = isKk ? tribe.history_kk : tribe.history_ru;
  const subtribes = tribe.subtribes;
  const name = isKk ? tribe.kk : tribe.ru;

  return (
    <article className="tribe-article-card">
      {/* Dark hero header */}
      <div className="tribe-card-hero">
        <div className="tribe-card-tamga-icon">{tribe.tamga}</div>
        <div className="tribe-card-hero-text">
          <h1 className="tribe-card-name">{name}</h1>
          {tribe.uran && (
            <p className="tribe-card-uran">&ldquo;{tribe.uran}&rdquo;</p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="tribe-card-meta-row">
        <div className="tribe-card-meta-item">
          <span className="tribe-card-meta-label">{isKk ? 'ЖҮЗ' : 'ЖУЗ'}</span>
          <span className="tribe-card-meta-value">{zhuzName}</span>
        </div>
        {region && (
          <div className="tribe-card-meta-item">
            <span className="tribe-card-meta-label">{labels.region.toUpperCase()}</span>
            <span className="tribe-card-meta-value">{region}</span>
          </div>
        )}
        {tribe.tamga && (
          <div className="tribe-card-meta-item">
            <span className="tribe-card-meta-label">{labels.tamga.toUpperCase()}</span>
            <span className="tribe-card-meta-value tamga-big">{tribe.tamga}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="tribe-card-section">
        <LinkedText text={desc} locale={locale} className="tribe-card-desc" selfPath={`/encyclopedia/${zhuzId}/${tribe.id}`} />
      </div>

      {/* History */}
      {history && (
        <div className="tribe-card-section">
          <h3 className="tribe-card-section-title">{isKk ? 'Тарихы' : 'История'}</h3>
          <LinkedText text={history} locale={locale} className="tribe-card-desc" selfPath={`/encyclopedia/${zhuzId}/${tribe.id}`} />
        </div>
      )}

      {/* Subtribes */}
      {subtribes && subtribes.length > 0 && (
        <div className="tribe-card-section">
          <h3 className="tribe-card-section-title">{isKk ? 'Ішкі рулар' : 'Подроды'}</h3>
          <div className="tribe-card-subtribes">
            {subtribes.map((st) => (
              <span key={st.kk} className="tribe-subtribe-tag">
                {isKk ? st.kk : st.ru}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notable people */}
      {tribe.notable.length > 0 && (
        <div className="tribe-card-section tribe-card-section--last">
          <h3 className="tribe-card-section-title">{labels.notable}</h3>
          <div className="tribe-card-notable-list">
            {tribe.notable.map((p) => (
              <div key={p.name} className="tribe-card-notable-item">
                <span className="tribe-card-notable-star">★</span>
                <div>
                  <span className="tribe-card-notable-name">{p.name}</span>
                  <span className="tribe-card-notable-role"> — {isKk ? p.role_kk : p.role_ru}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
