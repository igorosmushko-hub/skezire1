import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  const td = useTranslations('donate');

  return (
    <footer className="footer">
      <div className="footer-orn" aria-hidden="true" />
      <div className="container">
        <div className="footer-body">
          <div className="footer-brand">
            <span className="footer-logo">Шежіре</span>
            <p>{t('tagline')}</p>
            <a href="#donate-section" className="footer-donate-link">
              &#9830; {td('footerLink')}
            </a>
          </div>
          <blockquote className="footer-quote">
            <p>{t('quote')}</p>
            <cite>{t('cite')}</cite>
          </blockquote>
        </div>
        <p className="footer-copy">{t('copy')}</p>
      </div>
    </footer>
  );
}
