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
        <Link href={prev.href} className="enc-pager-link enc-pager-prev">
          <span className="enc-pager-dir">{t('pagerPrev')}</span>
          <span className="enc-pager-label">{prev.label}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link href={next.href} className="enc-pager-link enc-pager-next">
          <span className="enc-pager-dir">{t('pagerNext')}</span>
          <span className="enc-pager-label">{next.label}</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
