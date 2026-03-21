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
            <Link href={`/${locale}/order/canvas`} className="footer-link">
              {locale === 'kk' ? 'Картина тапсырыс беру' : 'Заказать картину'}
            </Link>
            <Link href={`/${locale}/blog`} className="footer-link">
              {locale === 'kk' ? 'Блог' : 'Блог'}
            </Link>
            <Link href={`/${locale}/glossary`} className="footer-link">
              {locale === 'kk' ? 'Глоссарий' : 'Глоссарий'}
            </Link>
          </nav>
          <blockquote className="footer-quote">
            <p>{t('quote')}</p>
            <cite>{t('cite')}</cite>
          </blockquote>
        </div>

        <hr className="footer-divider" />

        <div className="footer-legal">
          <nav className="footer-legal-nav">
            <Link href={`/${locale}/oferta`} className="footer-legal-link">
              {locale === 'kk' ? 'Оферта' : 'Оферта'}
            </Link>
            <Link href={`/${locale}/privacy`} className="footer-legal-link">
              {locale === 'kk' ? 'Құпиялылық' : 'Конфиденциальность'}
            </Link>
            <Link href={`/${locale}/delivery`} className="footer-legal-link">
              {locale === 'kk' ? 'Жеткізу' : 'Доставка'}
            </Link>
            <Link href={`/${locale}/refund`} className="footer-legal-link">
              {locale === 'kk' ? 'Қайтару' : 'Возврат'}
            </Link>
            <Link href={`/${locale}/payment-policy`} className="footer-legal-link">
              {locale === 'kk' ? 'Төлем саясаты' : 'Политика платежей'}
            </Link>
            <Link href={`/${locale}/contacts`} className="footer-legal-link">
              {locale === 'kk' ? 'Байланыс' : 'Контакты'}
            </Link>
          </nav>
          <p className="footer-requisites">
            {locale === 'kk'
              ? 'ЖК "ГЕНРИ МОРГАН" · ЖСН 870706300216 · Алматы қ.'
              : 'ИП "ГЕНРИ МОРГАН" · ИИН 870706300216 · г. Алматы'}
          </p>
        </div>

        <p className="footer-copy">{t('copy')}</p>
      </div>
    </footer>
  );
}
