import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface PagerLink {
  label: string;
  href: string;
}

interface PagerProps {
  prev?: PagerLink;
  next?: PagerLink;
}

export function Pager({ prev, next }: PagerProps) {
  const t = useTranslations('enc');

  return (
    <nav className="enc-pager">
      {prev ? (
        <Link href={prev.href}>
          {t('pagerPrev')} {prev.label}
        </Link>
      ) : (
        <span />
      )}
      <span className="pager-spacer" />
      {next ? (
        <Link href={next.href}>
          {next.label} {t('pagerNext')}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
