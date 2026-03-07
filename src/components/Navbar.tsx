import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LangSwitcher } from './LangSwitcher';
import { NavbarClient } from './NavbarClient';
import { NavbarAuth } from './NavbarAuth';

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');

  const links = [
    { href: '/#form-section' as const, label: t('create') },
    { href: '/ai' as const, label: t('ai'), className: 'nav-ai-link' },
    { href: '/zheti-ata' as const, label: t('zhetiAta') },
    { href: '/encyclopedia' as const, label: t('enc') },
    { href: '/order/canvas' as const, label: t('orderCanvas'), className: 'nav-order-link' },
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
