import { useTranslations } from 'next-intl';

export function About() {
  const t = useTranslations('about');

  return (
    <section id="about" className="about">
      <div className="about-ornament" />
      <div className="container">
        <div className="section-header">
          <div className="about-header-wrap">
            <span className="section-overline">{t('overline') ?? 'О платформе'}</span>
            <h2>{t('h2')}</h2>
          </div>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">🌳</div>
            <h3>{t('c1.h3')}</h3>
            <p>{t('c1.p')}</p>
          </div>
          <div className="about-card">
            <div className="about-icon">🏺</div>
            <h3>{t('c2.h3')}</h3>
            <p>{t('c2.p')}</p>
          </div>
          <div className="about-card">
            <div className="about-icon">🤖</div>
            <h3>{t('c3.h3')}</h3>
            <p>{t('c3.p')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
