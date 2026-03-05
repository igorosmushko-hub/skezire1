import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { NavbarClient } from './NavbarClient';
import { NavbarAuth } from './NavbarAuth';

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');

  const links = [
    { href: '/#about' as const, label: t('about') },
    { href: '/#form-section' as const, label: t('create') },
    { href: '/ai' as const, label: t('ai'), className: 'nav-ai-link' },
    { href: '/zheti-ata' as const, label: t('zhetiAta') },
    { href: '/glossary' as const, label: t('glossary') },
    { href: '/encyclopedia' as const, label: t('enc') },
    { href: '/blog' as const, label: t('blog') },
  ];

  return (
    <NavbarClient
      locale={locale}
      links={links}
      brand={
        <Link href="/" locale={locale} className="nav-brand">
          Шежіре
        </Link>
      }
      auth={<NavbarAuth />}
      langSwitcher={<LangSwitcher locale={locale} />}
    />
  );
}
