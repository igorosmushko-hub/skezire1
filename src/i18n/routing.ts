import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['kk', 'ru'],
  defaultLocale: 'kk',
  // hreflang is declared in the HTML (generateMetadata alternates); the HTTP
  // `Link` header would otherwise announce x-default URLs without a locale prefix.
  alternateLinks: false,
});

export const { Link, useRouter, usePathname, redirect } = createNavigation(routing);
