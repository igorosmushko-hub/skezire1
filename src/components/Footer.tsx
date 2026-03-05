import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="footer">
      <div className="footer-ornament" />
      <div className="container">
        <div className="footer-body">
          <div className="footer-brand">
            <span className="footer-logo">Шежіре</span>
            <p>{t('tagline')}</p>
          </div>
          <nav className="footer-nav">
            <Link href={`/${locale}/ai`} className="footer-link">
              {locale === 'kk' ? 'AI Мүмкіндіктері' : 'AI Функции'}
            </Link>
            <Link href={`/${locale}/encyclopedia`} className="footer-link">
              {locale === 'kk' ? 'Энциклопедия' : 'Энциклопедия'}
            </Link>
            <Link href={`/${locale}/zheti-ata`} className="footer-link">
              {locale === 'kk' ? 'Жеті ата' : 'Жеті ата'}
            </Link>
            <Link href={`/${locale}/blog`} className="footer-link">
              {locale === 'kk' ? 'Блог' : 'Блог'}
            </Link>
          </nav>
          <blockquote className="footer-quote">
            <p>{t('quote')}</p>
            <cite>{t('cite')}</cite>
          </blockquote>
        </div>
        <hr className="footer-divider" />
        <p className="footer-copy">{t('copy')}</p>
      </div>
    </footer>
  );
}
