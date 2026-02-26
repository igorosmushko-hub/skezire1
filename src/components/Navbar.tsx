import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { NavbarClient } from './NavbarClient';

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');

  return (
    <NavbarClient>
      <div className="nav-brand">
        <span className="nav-orn">◆</span>
        <span>Шежіре</span>
        <span className="nav-orn">◆</span>
      </div>
      <ul className="nav-links">
        <li><a href="#about">{t('about')}</a></li>
        <li><a href="#form-section">{t('create')}</a></li>
        <li><a href="#ai-section">{t('ai')}</a></li>
        <li><Link href="/encyclopedia" locale={locale}>{t('enc')}</Link></li>
      </ul>
      <LangSwitcher locale={locale} />
      <button className="nav-burger" aria-label="Меню">☰</button>
    </NavbarClient>
  );
}
