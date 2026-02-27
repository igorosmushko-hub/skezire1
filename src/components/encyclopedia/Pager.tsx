import Link from 'next/link';

interface PagerLink {
  label: string;
  href: string;
}

interface PagerProps {
  prev?: PagerLink;
  next?: PagerLink;
  prevLabel: string;
  nextLabel: string;
  locale: string;
}

export function Pager({ prev, next, prevLabel, nextLabel, locale }: PagerProps) {
  return (
    <nav className="enc-pager">
      {prev ? (
        <Link href={`/${locale}${prev.href}`}>
          {prevLabel} {prev.label}
        </Link>
      ) : (
        <span />
      )}
      <span className="pager-spacer" />
      {next ? (
        <Link href={`/${locale}${next.href}`}>
          {next.label} {nextLabel}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
