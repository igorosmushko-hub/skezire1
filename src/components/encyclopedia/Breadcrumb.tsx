import { Link } from '@/i18n/routing';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="enc-breadcrumb" aria-label="breadcrumb">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span>&rsaquo;</span>}
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span className="bc-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
