import { useTranslations } from 'next-intl';

export function DonationSection() {
  const t = useTranslations('donate');

  return (
    <section id="donate-section" className="donate-section">
      <div className="container">
        <div className="donate-inner">
          <div className="donate-orn" aria-hidden="true">&#9830;</div>
          <h2 className="donate-h2">{t('h2')}</h2>
          <p className="donate-desc">{t('desc')}</p>
          <a
            href="tel:+77756006661"
            className="btn btn-primary donate-btn"
          >
            {t('btn')}
          </a>
          <p className="donate-note">{t('note')}: <strong>{t('phone')}</strong></p>
        </div>
      </div>
    </section>
  );
}
