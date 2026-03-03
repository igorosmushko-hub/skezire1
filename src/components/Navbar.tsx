import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { NavbarClient } from './NavbarClient';
import { NavbarAuth } from './NavbarAuth';

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');

  return (
    <NavbarClient>
      <Link href="/" locale={locale} className="nav-brand">
        <span className="nav-orn">◆</span>
        <span>Шежіре</span>
        <span className="nav-orn">◆</span>
      </Link>
      <ul className="nav-links">
        <li><Link href="/#about" locale={locale}>{t('about')}</Link></li>
        <li><Link href="/#form-section" locale={locale}>{t('create')}</Link></li>
        <li><Link href="/#ai-section" locale={locale}>{t('ai')}</Link></li>
        <li><Link href="/zheti-ata" locale={locale}>{t('zhetiAta')}</Link></li>
        <li><Link href="/glossary" locale={locale}>{t('glossary')}</Link></li>
        <li><Link href="/encyclopedia" locale={locale}>{t('enc')}</Link></li>
        <li><Link href="/blog" locale={locale}>{t('blog')}</Link></li>
      </ul>
      <NavbarAuth />
      <LangSwitcher locale={locale} />
    </NavbarClient>
  );
}
